export function getLocalLanguage() {
  return navigator.language.split('-')[0] || 'en'
}
export const options = {
  locale: getLocalLanguage(),
  debug: false,
  fullscreen: false,
  autosize: false,
  symbol: 'BTCUSDT',
  interval: '1D',
  theme: 'light',
  allow_symbol_change: true,
  width: 800,
  height: 500
}