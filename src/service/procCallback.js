import procError from './procError'
import config from '../../config.json' assert { type: 'json' }

import { sendChatAction, editAttachMessageMedia } from '../helper/telegram'
import { InvalidCallbackDataError } from '../error'

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
  const [version, cmdKey, cmdParam] = data.split(DATA_SPLIT_BY)

  try {
    if (parseInt(version) !== config.version) {
      throw new InvalidCallbackDataError('Callback data version does not match')
    }

    if (config[cmdKey]) {
      const dataQuery = getQueryByCallbackData(data)
      const chartQuery = getChartImgQuery(cmdKey, dataQuery)
      const includeSymbols = cmdParam === 'true'

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
              cmdKey,
              dataQuery.inputs.row,
              dataQuery.inputs.column,
              dataQuery.interval
            )
          : getInitChartInlineKeys(cmdKey, dataQuery, includeSymbols),
      }

      const optParam = {
        reply_markup: JSON.stringify(relayMarkup),
      }

      const optMedia = {
        caption: `${dataQuery.symbol} ${dataQuery.interval}`,
      }

      return editChartPhotoCallback(
        TELEGRAM_API_TOKEN,
        message,
        attachPhoto,
        optParam,
        optMedia
      )
    } else {
      throw new InvalidCallbackDataError('Invalid callback data type')
    }
  } catch (error) {
    return procError(error, message.chat, env)
  }
}

/**
 * @param {String} apiToken
 * @param {Message} message
 * @param {Blob} attachPhoto
 * @param {Object} optParam
 * @param {Object} optMedia
 * @returns {Promise}
 */
function editChartPhotoCallback(
  apiToken,
  message,
  attachPhoto,
  optParam,
  optMedia
) {
  const aOptParam = Object.assign(
    {
      chat_id: message.chat.id,
      message_id: message.message_id,
    },
    optParam
  )

  return editAttachMessageMedia(
    apiToken,
    'photo',
    attachPhoto,
    aOptParam,
    optMedia
  )
}
