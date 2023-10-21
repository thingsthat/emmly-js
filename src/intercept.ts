import { EmmlyOptions, EmmlyResponse } from './client'
import { EmmlyResponseError } from './errors/EmmlyResponseError'

type InterceptRequest = {
  url: string
  options: Partial<EmmlyOptions>
  response?: EmmlyResponse
  error?: EmmlyResponseError
}

/**
 * Interceptors, so we intercept the requests and responses globally.
 */
export class Interceptors {
  handlers: { (request: InterceptRequest): void }[]

  constructor() {
    this.handlers = []
  }

  use(handler: (request: InterceptRequest) => void) {
    this.handlers.push(handler)
    return this.handlers.length - 1
  }

  forEach(value: InterceptRequest) {
    for (const handler of this.handlers) {
      handler(value)
    }
  }
}
