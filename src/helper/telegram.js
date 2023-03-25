import log from './logger.js'
import config from '../../config.json' assert { type: 'json' }

const BASE_API_URL = 'https://api.telegram.org'

export const webhookPath = 'webhook' // eg. https://example.com/webhook

/**
 * @param {String} apiToken
 * @param {Chat} chat
 * @param {String} actionType eg. typing, upload_photo, ...
 * @returns {Promise}
 */
export function sendChatAction(apiToken, chat, actionType = 'upload_photo') {
  return postJSON(apiToken, 'sendChatAction', {
    chat_id: chat.id,
    action: actionType,
  })
}

/**
 * @param {String} apiToken
 * @param {Object} payload
 * @returns {Promise}
 */
export function sendMessage(apiToken, payload) {
  return postJSON(apiToken, 'sendMessage', payload)
}

/**
 * @param {String} apiToken
 * @param {Chat} chat
 * @param {Blob} photo
 * @param {Object} opt
 * @returns {Promise}
 */
export function sendPhoto(apiToken, chat, photo, opt = {}) {
  const payload = new FormData()

  payload.append('chat_id', chat.id)
  payload.append('photo', photo)

  Object.keys(opt).forEach((key) => {
    payload.append(key, opt[key])
  })

  return fetch(`${BASE_API_URL}/bot${apiToken}/sendPhoto`, {
    method: 'POST',
    body: payload,
  })
}

/**
 * @param {String} apiToken
 * @param {String} mediaType eg. photo, ...
 * @param {Blob} mediaAttach eg. new Blob([media], { type: 'application/octet-stream' })
 * @param {Object} optParam eg. { chat_id: 1234, message_id: 1234, ... }
 * @param {Promise}
 */
export const editAttachMessageMedia = (
  apiToken,
  mediaType,
  mediaAttach,
  optParam = {},
  optMedia = {}
) => {
  const payload = new FormData()

  const attachName = '0'
  const media = {
    type: mediaType,
    media: `attach://${attachName}`,
  }

  Object.keys(optParam).forEach((key) => {
    payload.append(key, optParam[key])
  })

  Object.keys(optMedia).forEach((key) => {
    media[key] = optMedia[key]
  })

  payload.append(attachName, mediaAttach)
  payload.append('media', JSON.stringify(media))

  return fetch(`${BASE_API_URL}/bot${apiToken}/editMessageMedia`, {
    method: 'POST',
    body: payload,
  })
}

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

  return fetch(`${BASE_API_URL}/bot${apiToken}/${method}`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'content-type': 'application/json',
    },
  })
}
