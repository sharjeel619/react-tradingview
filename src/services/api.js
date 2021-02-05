export default class binanceAPI {
  constructor(options) {
    this.binanceHost = 'https://api.binance.com'
    this.debug = options.debug || false
  }

  binanceServerTime() {
    return fetch(this.binanceHost + '/api/v1/time').then(res => {
      return res.json()
    }).then(json => {
      return json.serverTime
    })
  }

  binanceSymbols() {
    return fetch(this.binanceHost + '/api/v1/exchangeInfo').then(res => {
      return res.json()
    }).then(json => {
      return json.symbols
    })
  }

  binanceKlines(symbol, interval, startTime, endTime, limit) {
    const url = this.binanceHost + '/api/v1/klines' +
      "?symbol=".concat(symbol) +
      "&interval=".concat(interval) +
      "&limit=".concat(limit) +
      "&startTime=".concat(startTime) +
      "&endTime=".concat(endTime)

    return fetch(url).then(res => {
      return res.json()
    }).then(json => {
      return json
    })
  }

  onReady(callback) {
    this.binanceSymbols().then((symbols) => {
      this.symbols = symbols
      callback({
        supports_marks: false,
        supports_timescale_marks: false,
        supports_time: true,
        supported_resolutions: [
          '1', '3', '5', '15', '30', '60', '120', '240', '360', '480', '720', '1D', '3D', '1W', '1M'
        ]
      })
    }).catch(err => {
      console.error(err)
    })
  }

  searchSymbols(userInput, exchange, symbolType, onResultReadyCallback) {
    userInput = userInput.toUpperCase()
    onResultReadyCallback(
      this.symbols.filter((symbol) => {
        return symbol.symbol.indexOf(userInput) >= 0
      }).map((symbol) => {
        return {
          symbol: symbol.symbol,
          full_name: symbol.symbol,
          description: symbol.baseAsset + ' / ' + symbol.quoteAsset,
          ticker: symbol.symbol,
          exchange: 'Binance',
          type: 'crypto'
        }
      })
    )
  }

  resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback) {
    this.debug && console.log('👉 resolveSymbol:', symbolName)

    const comps = symbolName.split(':')
    symbolName = (comps.length > 1 ? comps[1] : symbolName).toUpperCase()

    function pricescale(symbol) {
      for (let filter of symbol.filters) {
        if (filter.filterType == 'PRICE_FILTER') {
          return Math.round(1 / parseFloat(filter.tickSize))
        }
      }
      return 1
    }

    for (let symbol of this.symbols) {
      if (symbol.symbol == symbolName) {
        setTimeout(() => {
          onSymbolResolvedCallback({
            name: symbol.symbol,
            description: symbol.baseAsset + ' / ' + symbol.quoteAsset,
            ticker: symbol.symbol,
            exchange: 'Binance',
            listed_exchange: 'Binance',
            type: 'crypto',
            session: '24x7',
            minmov: 1,
            pricescale: pricescale(symbol),
            timezone: 'UTC',
            has_intraday: true,
            has_daily: true,
            has_weekly_and_monthly: true,
            currency_code: symbol.quoteAsset
          })
        }, 0)
        return
      }
    }

    onResolveErrorCallback('not found')
  }

  getBars(symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback, firstDataRequest) {
    if (this.debug) {
      console.log('👉 getBars:', symbolInfo.name, resolution)
      console.log('First:', firstDataRequest)
      console.log('From:', from, '(' + new Date(from * 1000).toGMTString() + ')')
      console.log('To:  ', to, '(' + new Date(to * 1000).toGMTString() + ')')
    }

    const interval = {
      '1': '1m',
      '3': '3m',
      '5': '5m',
      '15': '15m',
      '30': '30m',
      '60': '1h',
      '120': '2h',
      '240': '4h',
      '360': '6h',
      '480': '8h',
      '720': '12h',
      'D': '1d',
      '1D': '1d',
      '3D': '3d',
      'W': '1w',
      '1W': '1w',
      'M': '1M',
      '1M': '1M',
    }[resolution]

    if (!interval) {
      onErrorCallback('Invalid interval')
    }

    let totalKlines = []

    const finishKlines = () => {
      if (this.debug) {
        console.log('📊:', totalKlines.length)
      }

      if (totalKlines.length == 0) {
        onHistoryCallback([], { noData: true })
      } else {
        onHistoryCallback(totalKlines.map(kline => {
          return {
            time: kline[0],
            close: parseFloat(kline[4]),
            open: parseFloat(kline[1]),
            high: parseFloat(kline[2]),
            low: parseFloat(kline[3]),
            volume: parseFloat(kline[5])
          }
        }), {
          noData: false
        })
      }
    }

    const getKlines = (from, to) => {
      this.binanceKlines(symbolInfo.name, interval, from, to, 500).then(klines => {
        totalKlines = totalKlines.concat(klines)

        if (klines.length == 500) {
          from = klines[klines.length - 1][0] + 1
          getKlines(from, to)
        } else {
          finishKlines()
        }
      }).catch(err => {
        console.error(err)
        onErrorCallback('Some problem')
      })
    }

    from *= 1000
    to *= 1000

    getKlines(from, to)
  }

  subscribeBars(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) {
    this.debug && console.log('👉 subscribeBars:', subscriberUID)
  }

  unsubscribeBars(subscriberUID) {
    this.debug && console.log('👉 unsubscribeBars:', subscriberUID)
  }

  getServerTime(callback) {
    this.binanceServerTime().then(time => {
      callback(Math.floor(time / 1000))
    }).catch(err => {
      console.error(err)
    })
  }
}
