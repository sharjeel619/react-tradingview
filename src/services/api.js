import binanceWS from './socketClient'
export default class binanceAPI {
  constructor(options) {
    this.binanceHost = 'https://api.binance.com'
    this.debug = options.debug || false
    this.ws = new binanceWS()
  }

  binanceSymbols() {
    return fetch(this.binanceHost + '/api/v1/exchangeInfo').then(res => {
      return res.json()
    }).then(json => {
      return json.symbols
    })
  }

  binanceKlines(symbol, interval, startTime, endTime, limit) {
    const url = `${this.binanceHost}/api/v1/klines?symbol=${symbol}&interval=${interval}${startTime ? `&startTime=${startTime}` : ''}${endTime ? `&endTime=${endTime}` : ''}${limit ? `&limit=${limit}` : ''}`

    return fetch(url).then(res => {
      return res.json()
    }).then(json => {
      return json
    })
  }

  // chart specific functions below, impt that their function names stay same
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
            // timezone: 'UTC',
            has_intraday: true,
            has_daily: true,
            has_weekly_and_monthly: true,
            currency_code: symbol.quoteAsset
          })
        }, 0)
        return
      }
    }
    // minmov/pricescale will give the value of decimal places that will be shown on y-axis of the chart
    //
    onResolveErrorCallback('not found')
  }

  getBars(symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback, firstDataRequest) {
    const interval = this.ws.tvIntervals[resolution]
    if (!interval) {
      onErrorCallback('Invalid interval')
    }

    let totalKlines = []
    const kLinesLimit = 500
    const finishKlines = () => {
      if (totalKlines.length === 0) {
        onHistoryCallback([], { noData: true })
      } else {
        let historyCBArray = totalKlines.map(kline => ({
          time: kline[0],
          open: parseFloat(kline[1]),
          high: parseFloat(kline[2]),
          low: parseFloat(kline[3]),
          close: parseFloat(kline[4]),
          volume: parseFloat(kline[5])
        }))
        onHistoryCallback(historyCBArray, { noData: false })
      }
    }

    const getKlines = async (from, to) => {
      try {
        const data = await this.binanceKlines(symbolInfo.name, interval, from, to, kLinesLimit)
        totalKlines = totalKlines.concat(data)
        if (data.length === kLinesLimit) {
          from = data[data.length - 1][0] + 1
          getKlines(from, to)
        } else {
          finishKlines()
        }
      }
      catch (e) {
        console.error(e)
        onErrorCallback(`Error in 'getKlines' func`)
      }
    }

    from *= 1000
    to *= 1000
    getKlines(from, to)
  }

  subscribeBars(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) {
    this.ws.subscribeOnStream(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback)
  }

  unsubscribeBars(subscriberUID) {
    this.ws.unsubscribeFromStream(subscriberUID)
  }
}
