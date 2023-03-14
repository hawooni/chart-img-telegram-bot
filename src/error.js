export class ApiCredentialRequiredError extends Error {
  constructor(opt) {
    super('API credential is required', opt) // prettier-ignore
    this.name = this.constructor.name
    this.status = 403
  }
}
