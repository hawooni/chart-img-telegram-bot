import log from '../helper/logger'
import { JsonResponse } from '../helper/response'

export const vTelegramSecretToken = (req, { TELEGRAM_SECRET_TOKEN }) => {
  const apiSecretToken = req.headers.get('x-telegram-bot-api-secret-token')

  if (!apiSecretToken || apiSecretToken === TELEGRAM_SECRET_TOKEN) {
    // next()
  } else {
    log.warn('Telegram Secret Token does not match.')
    return new JsonResponse()
  }
}
