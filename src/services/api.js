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

  async getBars(symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback, firstDataRequest) {
    try {
      let interval = this.ws.tvIntervals[resolution]
      to *= 1000
      let data = await this.binanceKlines(symbolInfo.name, interval, null, to)
      if (!data || !data.length) onHistoryCallback([], { noData: true })
      else {
        data = data.map(item => ({
          time: item[0],
          close: parseFloat(item[4]),
          open: parseFloat(item[1]),
          high: parseFloat(item[2]),
          low: parseFloat(item[3]),
          volume: parseFloat(item[5])
        }))
        onHistoryCallback(data, { noData: true })
      }
    }
    catch (e) {
      console.error(e)
    }
  }

  subscribeBars(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) {
    this.ws.subscribeOnStream(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback)
  }

  unsubscribeBars(subscriberUID) {
    this.ws.unsubscribeFromStream(subscriberUID)
  }
}
