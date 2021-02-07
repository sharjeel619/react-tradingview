export function getLocalLanguage() {
  return navigator.language.split('-')[0] || 'en'
}
export const options = {
  locale: getLocalLanguage(),
  debug: false,
  fullscreen: false,
  autosize: false,
  symbol: 'BTCUSDT',
  interval: '60', // '1', '3', '5', '15', '30', '60', '120', '240', '360', '480', '720', '1D', '3D', '1W', '1M'
  theme: 'light',
  allow_symbol_change: true,
  width: 800,
  height: 500
}