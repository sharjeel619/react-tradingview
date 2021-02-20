import React, {
  Component,
} from 'react'
import './index.scss'
import TradingViewChart from '../../components/TradingViewChart'
import { options } from '../../global/tv'

export default class Home extends Component {
  constructor() {
    super()
    this.state = {
      ...options,
    }
  }

  render() {
    return (
      <div className="container">
        <header>
          <a target="_blank" rel="noopener noreferrer" href="https://coinpanel.com/">
            <img alt='Coin Panel Logo' lazy="true" src="./images/coinpanel.svg" />
            CoinPanel
          </a>
        </header>
        <div className="trading-chart">
          <TradingViewChart cOptions={this.state} />
        </div>
      </div>
    )
  }
}