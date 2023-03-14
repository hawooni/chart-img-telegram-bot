import log from './logger'

/**
 * @param {String} apiToken
 * @param {String} baseUrl eg. https://example.com
 * @param {String} secretToken
 * @param {Integer} maxConn
 * @returns {Promise}
 */
export function setWebhook(apiToken, baseUrl, secretToken, maxConn = 100) {
  return postPayload(apiToken, 'setWebhook', {
    url: `${baseUrl}/webhook`,
    max_connections: maxConn,
    secret_token: secretToken,
  })
}

/**
 * @param {String} apiToken
 * @param {String} method
 * @param {Object} payload
 * @returns {Promise}
 */
export function postPayload(apiToken, method, payload) {
  log.debug(`telegram.postPayload(apiToken, ${method}, ${JSON.stringify(payload)})`) // prettier-ignore

  return fetch(`https://api.telegram.org/bot${apiToken}/${method}`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'content-type': 'application/json',
    },
  })
}
