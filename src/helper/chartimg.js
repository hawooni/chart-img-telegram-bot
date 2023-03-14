import qs from 'query-string'
import log from './logger'

import { ApiCredentialRequiredError } from '../error'

const BASE_URL_V1 = 'https://api.chart-img.com/v1'
const BASE_URL_V2 = 'https://beta-api.chart-img.com/v2' // note: beta!!

/**
 * @param {String} apiKey
 * @param {Object} query
 * @returns {Promise}
 */
export function getTradingViewAdvancedChartRESTv1(apiKey, query, opt) {
  return getQueryRESTv1('/tradingview/advanced-chart', apiKey, query, opt)
}

/**
 * @param {String} apiKey
 * @param {Object} payload
 * @param {Object} opt
 * @returns {Promise}
 */
export function postTradingViewAdvancedChartRESTv2(apiKey, payload, opt) {
  return postPayloadRESTv2('/tradingview/advanced-chart', apiKey, payload, opt)
}

/**
 * @param {String} apiKey
 * @param {Object} payload
 * @param {Object} opt
 * @returns {Promise}
 */
export function postTradingViewLayoutRESTv2(apiKey, payload, opt) {
  return postPayloadRESTv2('/tradingview/layout-chart', apiKey, payload, opt)
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

  if (!apiKey) {
    throw new ApiCredentialRequiredError()
  }

  return fetch(`${BASE_URL_V1}${path}?${qs.stringify(query, opt.qs)}`, {
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

  if (!apiKey) {
    throw new ApiCredentialRequiredError()
  }

  const headers = {
    'x-api-key': apiKey,
    'content-type': 'application/json',
  }

  if (opt.sessionId) {
    headers['tradingview-session-id'] = opt.sessionId
  }

  return fetch(`${BASE_URL_V2}/${path}`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: headers,
  })
}
