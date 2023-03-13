import log from './helper/logger'

import { Router } from 'itty-router'
import { JsonResponse } from './helper/response'

import MSG from './message'

const router = Router()

router.all(
  '/*',
  () => new JsonResponse({ message: MSG.ROUTE_NOT_FOUND }, { status: 404 })
)

export default {
  async fetch(req, env, cxt) {
    return router.handle(req, env, cxt).catch((error) => {
      if (error.name === 'SyntaxError') {
        return new JsonResponse({ message: MSG.INVALID_REQUEST }, { status: 400 })
      } else if (error.status) {
        return new JsonResponse({ message: error.message }, { status: error.status }) // prettier-ignore
      } else {
        log.error(error.stack)
        return new JsonResponse({ message: error.message }, { status: 500 })
      }
    })
  },
}
