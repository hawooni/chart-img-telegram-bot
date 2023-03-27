import config from '../../config.json' assert { type: 'json' }

const DEFAULT_LEVEL = 'info'

const level = {
  error: 0,
  warn: 1,
  info: 2,
  verbose: 3,
  debug: 4,
}

// todo: implement cf-logpush

export default {
  error(message) {
    level[config.logLevel || DEFAULT_LEVEL] >= level['error'] &&
      console.error(`:: error :: ${message}`)
  },
  warn(message) {
    level[config.logLevel || DEFAULT_LEVEL] >= level['warn'] &&
      console.warn(`:: warn :: ${message}`)
  },
  info(message) {
    level[config.logLevel || DEFAULT_LEVEL] >= level['info'] &&
      console.info(`:: info :: ${message}`)
  },
  verbose(message) {
    level[config.logLevel || DEFAULT_LEVEL] >= level['verbose'] &&
      console.log(`:: verbose :: ${message}`)
  },
  debug(message) {
    level[config.logLevel || DEFAULT_LEVEL] >= level['debug'] &&
      console.debug(`:: debug :: ${message}`)
  },
}
