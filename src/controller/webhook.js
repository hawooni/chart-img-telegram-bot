import procWebhook from '../service/procWebhook'
import { JsonResponse } from '../helper/response'

export default async (req, env) => {
  if (req.headers.get('Content-Type') !== 'application/json') {
    return new JsonResponse({ message: 'Invalid Content Type' }, 400)
  } else {
    await procWebhook(await req.json(), env)
    return new JsonResponse()
  }
}
