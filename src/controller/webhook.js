import { JsonResponse } from '../helper/response'
import { procWebhook } from '../service/telegram'

export default async (req, env) => {
  if (req.headers.get('Content-Type') !== 'application/json') {
    return new JsonResponse({ message: 'Invalid Content Type' }, 400)
  } else {
    await procWebhook(await req.json(), env)
    return new JsonResponse()
  }
}
