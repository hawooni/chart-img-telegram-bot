import log from '../helper/logger'

import { sendMessage } from '../helper/telegram'

import {
  InvalidSymbolError,
  InvalidIntervalError,
  InvalidConfigError,
  InvalidRequestError,
  UnprocessableRequestError,
  TooManyRequestError,
  MessageNameNotFoundError,
} from '../error'

import MSG from '../message/telegram'

/**
 * @param {Error} error
 * @param {Chat} chat
 * @param {Env} env
 * @returns {Promise}
 */
export default function (error, chat, env) {
  const { TELEGRAM_API_TOKEN } = env

  if (
    error instanceof InvalidSymbolError ||
    error instanceof InvalidIntervalError ||
    error instanceof MessageNameNotFoundError
  ) {
    return sendMessage(TELEGRAM_API_TOKEN, {
      chat_id: chat.id,
      text: MSG.INVALID_COMMAND,
    })
  } else if (
    error instanceof InvalidConfigError ||
    error instanceof InvalidRequestError ||
    error instanceof UnprocessableRequestError
  ) {
    return sendMessage(TELEGRAM_API_TOKEN, {
      chat_id: chat.id,
      text: error.message || MSG.CONFIG_ERROR,
    })
  } else if (error instanceof TooManyRequestError) {
    return sendMessage(TELEGRAM_API_TOKEN, {
      chat_id: chat.id,
      text: MSG.TOO_MANY_REQUEST,
    })
  } else {
    log.error(error.stack)
    return sendMessage(TELEGRAM_API_TOKEN, {
      chat_id: chat.id,
      text: MSG.UNKNOWN_ERROR,
    })
  }
}
