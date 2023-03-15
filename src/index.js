import log from './helper/logger'
import controllerWebhook from './controller/webhook'

import { Router } from 'itty-router'
import { JsonResponse } from './helper/response'
import { webhookPath } from './helper/telegram'
import { vSecretToken } from './middleware/telegram'

const router = Router()

router.post(`/${webhookPath}`, vSecretToken, controllerWebhook)

router.all(
  '/*',
  () => new JsonResponse({ message: 'Route Not Found' }, { status: 404 })
)

export default {
  fetch(req, env, cxt) {
    return router.handle(req, env, cxt).catch((error) => {
      if (error.name === 'SyntaxError') {
        return new JsonResponse({ message: 'Invalid Request' }, { status: 400 })
      } else if (error.status) {
        return new JsonResponse(
          { message: error.message },
          { status: error.status }
        )
      } else {
        log.error(error.stack)
        return new JsonResponse(
          { message: error.message || 'Something Went Wrong' },
          { status: 500 }
        )
      }
    })
  },
}
