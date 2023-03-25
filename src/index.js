import log from './helper/logger'
import controllerWebhook from './controller/webhook'

import { Router } from 'itty-router'
import { webhookPath } from './helper/telegram'
import { JsonResponse } from './helper/response'
import { vTelegramSecretToken } from './middleware/webhook'

import MSG from './message/status'

const router = Router()

router.post(`/${webhookPath}`, vTelegramSecretToken, controllerWebhook)

router.all(
  '/*',
  () => new JsonResponse({ message: MSG.ROUTE_NOT_FOUND }, { status: 404 })
)

export default {
  fetch(req, env, cxt) {
    return router.handle(req, env, cxt).catch((error) => {
      if (error.name === 'SyntaxError') {
        return new JsonResponse(
          { message: MSG.INVALID_REQUEST },
          { status: 400 }
        )
      } else if (error.status) {
        return new JsonResponse(
          { message: error.message },
          { status: error.status }
        )
      } else {
        log.error(error.stack)
        return new JsonResponse(
          { message: error.message || MSG.UNKNOWN_ERROR },
          { status: 500 }
        )
      }
    })
  },
}
