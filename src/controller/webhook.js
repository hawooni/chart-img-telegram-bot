import procWebhook from '../service/procWebhook'
import { JsonResponse } from '../helper/response'

import MSG from '../message/status'

export default async (req, env) => {
  if (req.headers.get('Content-Type') !== 'application/json') {
    return new JsonResponse({ message: MSG.INVALID_CONTENT_TYPE }, 400)
  } else {
    await procWebhook(await req.json(), env)
    return new JsonResponse()
  }
}
