import { JsonResponse } from '../helper/response'

export const vTelegramSecretToken = (req, { TELEGRAM_SECRET_TOKEN }) => {
  const apiSecretToken = req.headers.get('x-telegram-bot-api-secret-token')

  if (!apiSecretToken || apiSecretToken === TELEGRAM_SECRET_TOKEN) {
    // next()
  } else {
    return new JsonResponse()
  }
}
