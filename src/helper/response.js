export class JsonResponse extends Response {
  constructor(body, opt = {}) {
    super(
      JSON.stringify(body),
      Object.assign(
        {
          headers: {
            'content-type': 'application/json;charset=UTF-8',
          },
        },
        opt
      )
    )
  }
}
