export default class SocketClient {
  constructor(base_url, path) {
    // 'wss://stream.binance.com:9443/ws'
    // 'wss://streamer.cryptocompare.com'
    this.baseUrl = 'wss://stream.binance.com:9443/ws' || base_url
    this._path = path || ''
    this._createSocket()
    this.tvIntervals = {
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
    }
    this.lastSocketData = {}
    this.listener = null,
    this.paramStr = ''
  }

  _createSocket() {
    this._ws = new WebSocket(`${this.baseUrl}${this._path}`)
    this._ws.onopen = (e) => {
      console.info(`Binance WS Open`)
    }

    this._ws.onclose = () => {
      console.warn('Binance WS Closed')
    }

    this._ws.onerror = (err) => {
      console.warn('WS Error', err)
    }

    this._ws.onmessage = (msg) => {
      let sData = JSON.parse(msg.data)
      // console.log(sData)
      if (sData && sData.k) {
        let {o ,h, l, v, c, T ,t} = sData.k
        this.lastSocketData = {
          time: t,
          close: parseFloat(c),
          open: parseFloat(o),
          high: parseFloat(h),
          low: parseFloat(l),
          volume: parseFloat(v),
          closeTime: T,
          openTime: t,
        }
        this.listener(this.lastSocketData)
      }
    }
  }

  subscribeOnStream(symbolInfo, resolution, onRealtimeCallback, subscribeUID, onResetCacheNeededCallback, lastDailyBar) {
    console.log(subscribeUID)
    this.paramStr = `${symbolInfo.name.toLowerCase()}@kline_${this.tvIntervals[resolution]}`
    const obj = {
      method: "SUBSCRIBE",
      params: [
        this.paramStr
      ],
      id: 1
    }
    if (this._ws.readyState === 1) {
      this._ws.send(JSON.stringify(obj))
    }
    this.listener = onRealtimeCallback
  }
  unsubscribeFromStream(subscriberUID) {
    const obj = {
      method: "UNSUBSCRIBE",
      params: [
        this.paramStr
      ],
      id: 1
    }
    if (this._ws.readyState === 1) {
      this._ws.send(JSON.stringify(obj))
    }
  }
}
