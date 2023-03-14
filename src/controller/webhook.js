import { JsonResponse } from '../helper/response'
import { procWebhook } from '../service/telegram'

import MSG from '../message'

export default async (req) => {
  if (req.headers.get('Content-Type') !== 'application/json') {
    return new JsonResponse({ message: MSG.INVALID_CONTENT_TYPE }, 400)
  }

  return req
    .json()
    .then((payload) => procWebhook(payload))
    .then(() => new JsonResponse())
}
