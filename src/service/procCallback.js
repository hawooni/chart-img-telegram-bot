import procError from './procError'
import config from '../../config.json' assert { type: 'json' }

import { InvalidConfigError } from '../error'
import { sendChatAction, editAttachMessageMedia } from '../helper/telegram'

import {
  getChartImgQuery,
  getChartImgPhoto,
  getInitChartInlineKeys,
  getIndexChartInlineKeys,
  getQueryByCallbackData,
} from '../helper/query'

const DATA_SPLIT_BY = '|'

export default async function (payload, env) {
  const { TELEGRAM_API_TOKEN, CHART_IMG_API_KEY } = env

  const { message, data } = payload
  const [version, type, typeParam] = data.split(DATA_SPLIT_BY)

  try {
    if (parseInt(version) !== config.version) {
      throw new InvalidConfigError('Callback data version does not match')
    }

    if (type === 'chart') {
      const dataQuery = getQueryByCallbackData(data)
      const chartQuery = getChartImgQuery(dataQuery)
      const includeSymbols = typeParam === 'true'

      const [chartPhoto] = await Promise.all([
        getChartImgPhoto(CHART_IMG_API_KEY, chartQuery),
        sendChatAction(TELEGRAM_API_TOKEN, message.chat), // action >>> sending a photo
      ])

      const attachPhoto = new Blob([await chartPhoto.arrayBuffer()], {
        type: 'application/octet-stream',
      })

      const relayMarkup = {
        inline_keyboard: dataQuery.inputs
          ? getIndexChartInlineKeys(
              dataQuery.inputs.row,
              dataQuery.inputs.column,
              dataQuery.interval
            )
          : getInitChartInlineKeys(dataQuery, includeSymbols),
      }

      return editChartPhotoCallback(
        TELEGRAM_API_TOKEN,
        message,
        attachPhoto,
        relayMarkup
      )
    } else {
      throw new InvalidConfigError('Invalid callback data type')
    }
  } catch (error) {
    return procError(error, message.chat, env)
  }
}

/**
 * @param {String} apiToken
 * @param {Message} message
 * @param {Blob} attachPhoto
 * @param {Object} relayMarkup
 * @returns {Promise}
 */
function editChartPhotoCallback(apiToken, message, attachPhoto, relayMarkup) {
  const param = {
    chat_id: message.chat.id,
    message_id: message.message_id,
  }

  if (relayMarkup) {
    param.reply_markup = JSON.stringify(relayMarkup)
  }

  return editAttachMessageMedia(apiToken, 'photo', attachPhoto, param)
}
