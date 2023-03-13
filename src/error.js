export class ApiKeyRequiredError extends Error {
  constructor(opt) {
    super('API key is required', opt) // prettier-ignore
    this.name = this.constructor.name
    this.status = 403
  }
}
