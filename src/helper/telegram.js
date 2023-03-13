/**
 * @param {String} apiToken
 * @param {String} method
 * @param {Object} payload
 * @returns {Promise}
 */
export function postPayload(apiToken, method, payload) {
  return fetch(`https://api.telegram.org/bot${apiToken}/${method}`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'content-type': 'application/json',
    },
  })
}
