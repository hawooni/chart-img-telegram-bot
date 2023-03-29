import log from '../helper/logger'

import { sendMessage } from '../helper/telegram'

import {
  InvalidSymbolError,
  InvalidIntervalError,
  InvalidConfigError,
  InvalidRequestError,
  InvalidCommandError,
  InvalidCallbackDataError,
  UnprocessableRequestError,
  TooManyRequestError,
  MessageNameNotFoundError,
  UnauthorizedRequestError,
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
    error instanceof MessageNameNotFoundError ||
    error instanceof InvalidCommandError
  ) {
    return sendMessage(TELEGRAM_API_TOKEN, {
      chat_id: chat.id,
      text: MSG.INVALID_COMMAND,
    })
  } else if (
    error instanceof InvalidRequestError ||
    error instanceof UnprocessableRequestError
  ) {
    return sendMessage(TELEGRAM_API_TOKEN, {
      chat_id: chat.id,
      text: error.message || MSG.CONFIG_ERROR,
    })
  } else if (
    error instanceof InvalidConfigError ||
    error instanceof InvalidCallbackDataError
  ) {
    error.message && log.verbose(error.message)
    return sendMessage(TELEGRAM_API_TOKEN, {
      chat_id: chat.id,
      text: MSG.CONFIG_CHANGE,
    })
  } else if (error instanceof TooManyRequestError) {
    return sendMessage(TELEGRAM_API_TOKEN, {
      chat_id: chat.id,
      text: MSG.TOO_MANY_REQUEST,
    })
  } else if (error instanceof UnauthorizedRequestError) {
    return sendMessage(TELEGRAM_API_TOKEN, {
      chat_id: chat.id,
      text: MSG.API_KEY_AUTH_ERROR,
    })
  } else {
    log.error(error.stack)
    return sendMessage(TELEGRAM_API_TOKEN, {
      chat_id: chat.id,
      text: MSG.UNKNOWN_ERROR,
    })
  }
}
