import procError from './procError'
import config from '../../config.json' assert { type: 'json' }

import { reservedKeys } from '../helper/config'
import { sendMessage, sendPhoto, sendChatAction } from '../helper/telegram'
import { MessageNameNotFoundError } from '../error'

import {
  getChartImgQuery,
  getQueryByCmdText,
  getChartImgPhoto,
  getInitChartInlineKeys,
} from '../helper/query'

/**
 * @param {Chat} chat message
 * @param {String} text command eg. /chart binance:btcusdt, /nasdaq, /crypto, ...
 * @param {Env} env
 * @returns {Promise}
 */
export default async function (chat, text, env) {
  const { TELEGRAM_API_TOKEN, CHART_IMG_API_KEY } = env

  try {
    const cmdKey = text.split(' ')[0].split('@')[0].substring(1) // eg. /chart => chart, /chart@exampleBot => chart

    if (!reservedKeys.includes(cmdKey) && config[cmdKey]) {
      const textQuery = config[cmdKey].inputs
        ? getQueryByCmdText(`/${cmdKey}`) // preset exist
        : getQueryByCmdText(text)

      const chartQuery = getChartImgQuery(cmdKey, textQuery)

      const [chartPhoto] = await Promise.all([
        getChartImgPhoto(CHART_IMG_API_KEY, chartQuery),
        sendChatAction(TELEGRAM_API_TOKEN, chat), // action >>> sending a photo
      ])

      return sendChartPhoto(
        TELEGRAM_API_TOKEN,
        chat,
        chartPhoto,
        cmdKey,
        textQuery
      )
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
 * @param {String} cmdKey
 * @param {Object} query
 * @returns {Promise}
 */
function sendChartPhoto(apiToken, chat, photo, cmdKey, query = {}) {
  const { symbol, interval } = query

  if (symbol && interval) {
    // send photo without reply markup inline keyboard
    return sendPhoto(apiToken, chat, photo, {
      caption: `${symbol} ${interval}`,
    })
  } else {
    const cmdKeyDefault = config[cmdKey].default
    const opt = {
      caption: `${symbol || cmdKeyDefault.symbol} ${interval || cmdKeyDefault.interval}`, // prettier-ignore
      reply_markup: JSON.stringify({
        inline_keyboard: getInitChartInlineKeys(cmdKey, query, !symbol),
      }),
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
    const payload = {
      chat_id: chat.id,
      text: message.text,
    }

    if (message.parseMode) {
      payload.parse_mode = message.parseMode
    }

    return sendMessage(apiToken, payload)
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
