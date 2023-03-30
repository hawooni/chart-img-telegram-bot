import log from '../helper/logger'
import procCommand from './procCommand'
import procCallbackData from './procCallback'
import config from '../../config.json' assert { type: 'json' }

import { ChatType, ChatStatus } from '../enum/telegram'

/**
 * @param {Object} payload
 * @returns {Promise}
 */
export default async function (payload, env) {
  const { message, my_chat_member, callback_query } = payload

  if (message) {
    const { chat, text, from } = message

    if (text && text.startsWith('/')) {
      const cmdText = text.trim()

      if (chat.type === ChatType.PRIVATE) {
        if (isPrivateMessageEnabled()) {
          if (isPrivateMessageAllowed(from.id)) {
            log.info(`${chat.type} message from ${chat.first_name} (${from.id}) - ${cmdText}`) // prettier-ignore
            await procCommand(chat, cmdText, env)
          } else {
            log.verbose(`private message from ${from.first_name} (${from.id}) is not allowed`) // prettier-ignore
          }
        } else {
          log.verbose('private message is disabled')
        }
      } else if (
        chat.type === ChatType.GROUP ||
        chat.type === ChatType.SUPERGROUP
      ) {
        if (isGroupMessageEnabled()) {
          if (isGroupMessageAllowed(from.id)) {
            log.info(`${chat.type} message from ${from.first_name} (${from.id}) - ${cmdText}`) // prettier-ignore
            await procCommand(chat, cmdText, env)
          } else {
            log.verbose(`group message from ${from.first_name} (${from.id}) is not allowed`) // prettier-ignore
          }
        } else {
          log.verbose('group message is disabled')
        }
      }
    }
  } else if (my_chat_member) {
    const { chat, old_chat_member, new_chat_member } = my_chat_member
    const { status: oldStatus } = old_chat_member
    const {
      status: newStatus,
      can_send_messages: newCanSendMsg, // group
      can_send_media_messages: newCanSendMediaMsg, // group
    } = new_chat_member

    const updateInfo = `${chat.type} ${chat.title} (${chat.id}) - ${newStatus} `

    if (chat.type === ChatType.GROUP || chat.type === ChatType.SUPERGROUP) {
      if (
        newStatus === ChatStatus.MEMBER ||
        newStatus === ChatStatus.ADMINISTRATOR
      ) {
        // if the group permission is preset there is no way to know if the bot has enough permission when first join

        if (oldStatus === ChatStatus.LEFT || oldStatus === ChatStatus.KICKED) {
          log.info(`bot joined ${updateInfo}`)
        } else {
          log.verbose(`bot is allowed to post ${updateInfo}`)
        }
      } else if (newStatus === ChatStatus.RESTRICTED) {
        if (newCanSendMsg && newCanSendMediaMsg) {
          log.verbose(`bot is allowed to post ${updateInfo}`)
        } else {
          log.verbose(`bot is not allowed to post ${updateInfo}`)
        }
      } else if (
        newStatus === ChatStatus.LEFT ||
        newStatus === ChatStatus.KICKED
      ) {
        log.info(`bot left ${updateInfo}`)
      }
    }
  } else if (callback_query) {
    log.verbose(`telegram webhook - callback_query`)

    const { from } = callback_query
    const { chat } = callback_query.message

    if (chat.type === ChatType.PRIVATE) {
      if (isPrivateMessageEnabled()) {
        if (isPrivateMessageAllowed(from.id)) {
          log.info(`${chat.type} callback_query from ${from.first_name} (${from.id})`) // prettier-ignore
          await procCallbackData(callback_query, env)
        } else {
          log.verbose(`private callback_query from (${from.id}) is not allowed`) // prettier-ignore
        }
      } else {
        log.verbose('private message is disabled')
      }
    } else if (
      chat.type === ChatType.GROUP ||
      chat.type === ChatType.SUPERGROUP
    ) {
      if (isGroupMessageEnabled()) {
        if (isGroupMessageAllowed(from.id)) {
          log.info(`${chat.type} callback_query from ${chat.title} (${from.id})`) // prettier-ignore
          await procCallbackData(callback_query, env)
        } else {
          log.verbose(`group callback_query from (${from.id}) is not allowed`)
        }
      } else {
        log.verbose('group message is disabled')
      }
    } else {
      log.verbose('unknown callback_query')
    }
  }
}

/**
 * @returns {Boolean}
 */
function isPrivateMessageEnabled() {
  if (config.private) {
    return config.private.enabled
  }
  return true
}

/**
 * @param {Message} fromId
 * @returns {Boolean}
 */
function isPrivateMessageAllowed(fromId) {
  if (config.private?.allowFromIds) {
    return (
      config.private.allowFromIds.length === 0 ||
      config.private.allowFromIds.includes(fromId)
    )
  }
  return true
}

/**
 * @returns {Boolean}
 */
function isGroupMessageEnabled() {
  if (config.group) {
    return config.group.enabled
  }
  return true
}

/**
 * @param {Message} fromId
 * @returns {Boolean}
 */
function isGroupMessageAllowed(fromId) {
  if (config.group?.allowFromIds) {
    return (
      config.group.allowFromIds.length === 0 ||
      config.group.allowFromIds.includes(fromId)
    )
  }
  return true
}
