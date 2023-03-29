export class InvalidConfigError extends Error {
  constructor(message, opt) {
    super(message, opt)
    this.name = this.constructor.name
  }
}

export class InvalidCommandError extends Error {
  constructor(message, opt) {
    super(message, opt)
    this.name = this.constructor.name
  }
}

export class InvalidCallbackDataError extends Error {
  constructor(message, opt) {
    super(message, opt)
    this.name = this.constructor.name
  }
}

export class InvalidSymbolError extends Error {
  constructor(symbol, opt) {
    super(`Invalid Symbol${symbol ? ' (' + symbol + ')' : ''}`, opt)
    this.name = this.constructor.name
    this.symbol = symbol
  }
}

export class InvalidIntervalError extends Error {
  constructor(interval, opt) {
    super(`Invalid Interval${interval ? ' (' + interval + ')' : ''}`, opt)
    this.name = this.constructor.name
    this.interval = interval
  }
}

export class InvalidRequestError extends Error {
  constructor(message, status = 400, opt) {
    super(message, opt)
    this.name = this.constructor.name
    this.status = status
  }
}

export class UnauthorizedRequestError extends Error {
  constructor(message, status = 403, opt) {
    super(message, opt)
    this.name = this.constructor.name
    this.status = status
  }
}

export class UnprocessableRequestError extends Error {
  constructor(message, status = 422, opt) {
    super(message, opt)
    this.name = this.constructor.name
    this.status = status
  }
}

export class TooManyRequestError extends Error {
  constructor(message, status = 429, opt) {
    super(message, opt)
    this.name = this.constructor.name
    this.status = status
  }
}

export class RequestError extends Error {
  constructor(message, status = 500, opt) {
    super(message, opt)
    this.name = this.constructor.name
    this.status = status
  }
}

export class MessageNameNotFoundError extends Error {
  constructor(name, opt) {
    super(`Message name not found${name ? ' (' + name + ')' : ''}`, opt)
    this.name = this.constructor.name
  }
}
