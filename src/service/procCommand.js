import procError from './procError'
import config from '../../config.json' assert { type: 'json' }

import { sendMessage, sendPhoto, sendChatAction } from '../helper/telegram'
import { MessageNameNotFoundError } from '../error'

import {
  getChartImgQuery,
  getQueryByText,
  getChartImgPhoto,
  getInitChartInlineKeys,
} from '../helper/query'

/**
 * @param {Chat} chat message
 * @param {String} text command
 * @param {Env} env
 * @returns {Promise}
 */
export default async function (chat, text, env) {
  const { TELEGRAM_API_TOKEN, CHART_IMG_API_KEY } = env

  try {
    if (text.startsWith('/chart')) {
      const textQuery = getQueryByText(text)
      const chartQuery = getChartImgQuery(textQuery)

      const [chartPhoto] = await Promise.all([
        getChartImgPhoto(CHART_IMG_API_KEY, chartQuery),
        sendChatAction(TELEGRAM_API_TOKEN, chat), // action >>> sending a photo
      ])

      return sendChartPhoto(TELEGRAM_API_TOKEN, chat, chartPhoto, textQuery)
    } else {
      return sendMessageByName(TELEGRAM_API_TOKEN, chat, text)
    }
  } catch (error) {
    return procError(error, chat, env)
  }
}

/**
 * @param {String} apiToken
 * @param {Chat} chat
 * @param {Blob} photo
 * @param {Object} query
 * @returns {Promise}
 */
function sendChartPhoto(apiToken, chat, photo, query = {}) {
  const { symbol, interval } = query

  if (symbol && interval) {
    return sendPhoto(apiToken, chat, photo) // send photo without inline keyboard
  } else {
    const relayMarkup = {
      inline_keyboard: getInitChartInlineKeys(query, !symbol),
    }
    const opt = {
      reply_markup: JSON.stringify(relayMarkup),
    }

    return sendPhoto(apiToken, chat, photo, opt) // send photo with inline keyboard
  }
}

/**
 * @param {String} apiToken
 * @param {Chat} chat
 * @param {String} name
 * @returns {Promise}
 */
function sendMessageByName(apiToken, chat, name) {
  const message = getMessage(name.split('@')[0])

  if (message?.text) {
    return sendMessage(apiToken, {
      chat_id: chat.id,
      text: message.text,
    })
  } else {
    throw new MessageNameNotFoundError(name)
  }
}

/**
 * @param {String} name
 * @returns {Object|undefined}
 */
function getMessage(name) {
  return config.messages.find((message) => message.name === name)
}
