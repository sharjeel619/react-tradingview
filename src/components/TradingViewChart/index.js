import React, {
  Component,
} from 'react'
import './index.scss'

import binanceAPI from '../../services/api'
import {widget} from '../../scripts/charting_library/charting_library.esm'
import {options} from '../../global/tv'

export default class TradingViewChart extends Component {
  constructor(props) {
    super()
    this.state = {
      isChartReady : false
    }
    const {cOptions} = props
    this.bfAPI = new binanceAPI({debug: false})
    this.widgetOptions = {
      container_id: "chart_container",
      datafeed: this.bfAPI,
      library_path: "../../scripts/charting_library/",
      ...options,
      ...cOptions // props override default values of constructor options
    }
    this.tradingViewWidget = null
    this.chartObject = null
  }

  chartReady = () => {
    this.tradingViewWidget.onChartReady(() => {
      this.setState({
        isChartReady: true
      })
    })
  }

  componentDidMount() {
    this.tradingViewWidget = new widget(this.widgetOptions)
    this.chartReady()
  }

  componentDidUpdate() {
    // Use events and methods here. All events and methods available here
    // Can use global context for changing/setting values 
    this.props.getTheme(this.tradingViewWidget.getTheme())
    this.chartObject = this.tradingViewWidget.chart()
    this.tradingViewWidget.save((obj) => {})
  }

  render() {
    return (
      <div id='chart_container'></div>
    )
  }
}