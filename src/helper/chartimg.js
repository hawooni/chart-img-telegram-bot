import log from './logger'
import qs from 'query-string'
import config from '../../config.json' assert { type: 'json' }

const BASE_API_URL =
  config.override?.chartImgApiURL || 'https://api.chart-img.com'

export const intervals = [
  '1m',
  '3m',
  '5m',
  '15m',
  '30m',
  '45m',
  '1h',
  '2h',
  '3h',
  '4h',
  '1D',
  '1W',
  '1M',
  '3M',
  '6M',
  '1Y',
]

/**
 * @param {String} apiKey
 * @param {Object} query
 * @returns {Promise}
 */
export function getTradingViewAdvancedChartRESTv1(apiKey, query, opt = {}) {
  return getQueryRESTv1('tradingview/advanced-chart', apiKey, query, opt)
}

/**
 * @param {String} apiKey
 * @param {Object} payload
 * @param {Object} opt
 * @returns {Promise}
 */
export function postTradingViewAdvancedChartRESTv2(apiKey, payload, opt = {}) {
  return postPayloadRESTv2('tradingview/advanced-chart', apiKey, payload, opt)
}

/**
 * @param {String} apiKey
 * @param {Object} payload
 * @param {Object} opt
 * @returns {Promise}
 */
export function postTradingViewLayoutRESTv2(apiKey, payload, opt = {}) {
  return postPayloadRESTv2('tradingview/layout-chart', apiKey, payload, opt)
}

/**
 * @param {String} path eg. /tradingview/mini-chart
 * @param {String} apiKey
 * @param {Object} query eg. { symbol: 'BINANCE:ETHUSDT', interval: '1M', ... }
 * @param {Object} opt eg. { qs: { encode: false }}
 * @returns {Promise}
 */
function getQueryRESTv1(path, apiKey, query = {}, opt = {}) {
  log.debug(`chartimg.getQueryRESTv1(${path}, apiKey, ${JSON.stringify(query)}, ${JSON.stringify(opt)})`) // prettier-ignore

  return fetch(`${BASE_API_URL}/v1/${path}?${qs.stringify(query, opt.qs)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  })
}

/**
 * @param {String} path eg. /tradingview/advanced-chart
 * @param {String} apiKey
 * @param {Object} payload
 * @param {Object} opt eg. { sessionId: 'secretstring' }
 * @returns {Promise}
 */
function postPayloadRESTv2(path, apiKey, payload, opt = {}) {
  log.debug(`chartimg.postPayloadRESTv2(${path}, apiKey, ${JSON.stringify(payload)}, ${JSON.stringify(opt)})`) // prettier-ignore

  const headers = {
    'x-api-key': apiKey,
    'content-type': 'application/json',
  }

  if (opt.sessionId) {
    headers['tradingview-session-id'] = opt.sessionId
  }

  return fetch(`${BASE_API_URL}/v2/${path}`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: headers,
  })
}
