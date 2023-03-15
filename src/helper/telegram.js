import log from './logger.js'
import config from '../../config.json' assert { type: 'json' }

export const webhookPath = 'webhook' // eg. https://example.com/webhook

/**
 * @param {String} apiToken
 * @returns {Promise}
 */
export function setMyCommands(apiToken) {
  if (!Array.isArray(config.commands))
    throw Error('config commands must be an array')

  return postJSON(apiToken, 'setMyCommands', { commands: config.commands })
}

/**
 * @param {String} apiToken
 * @param {String} baseUrl eg. https://example.com
 * @param {String} secretToken
 * @param {Integer} maxConn
 * @returns {Promise}
 */
export function setWebhook(apiToken, baseUrl, secretToken, maxConn = 100) {
  return postJSON(apiToken, 'setWebhook', {
    url: `${baseUrl}/${webhookPath}`,
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
export function postJSON(apiToken, method, payload) {
  log.debug(`telegram.postPayload(apiToken, ${method}, ${JSON.stringify(payload)})`) // prettier-ignore

  return fetch(`https://api.telegram.org/bot${apiToken}/${method}`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'content-type': 'application/json',
    },
  })
}
