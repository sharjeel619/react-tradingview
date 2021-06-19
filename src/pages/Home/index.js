import React, { Component } from "react";
import "./index.scss";
import TradingViewChart from "../../components/TradingViewChart";

function getLocalLanguage() {
  return navigator.language.split('-')[0] || 'en'
}
export default class Home extends Component {
  constructor() {
    super();
    this.cOptions = {
      locale: getLocalLanguage(),
      debug: false,
      fullscreen: false,
      symbol: 'BTCUSDT',
      interval: '60', // '1', '3', '5', '15', '30', '60', '120', '240', '360', '480', '720', '1D', '3D', '1W', '1M'
      theme: 'light',
      allow_symbol_change: true,
      autosize: true,
      width: 800,
      height: 500
    }
  }

  render() {
    return (
      <div className="container">
        <div className="trading-chart">
          <h2>
            This project uses Tradingview library along with Binance API and
            Binance Websockets to display different markets on the chart.
          </h2>
          <TradingViewChart chartOptions={this.cOptions} />
        </div>
      </div>
    );
  }
}
