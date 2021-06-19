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
      interval: '60',
      theme: 'light',
      allow_symbol_change: true,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      autosize: true,
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
          <TradingViewChart chartProperties={this.cOptions} />
        </div>
      </div>
    );
  }
}
