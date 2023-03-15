import { JsonResponse } from '../helper/response'

export const vSecretToken = (req, env) => {
  const apiSecretToken = req.headers.get('x-telegram-bot-api-secret-token')

  if (!apiSecretToken || apiSecretToken === env.TELEGRAM_SECRET_TOKEN) {
    // next()
  } else {
    return new JsonResponse()
  }
}
