import { EmmlyOptions, EmmlyResponse } from './client'
import { EmmlyResponseError } from './errors/EmmlyResponseError'

type InterceptRequest = {
  error?: EmmlyResponseError
  options: Partial<EmmlyOptions>
  response?: EmmlyResponse
  url: string
}

/**
 * Interceptors for the requests and responses globally.
 */
export class Interceptors {
  handlers: { (request: InterceptRequest): void }[]

  constructor() {
    this.handlers = []
  }

  each(value: InterceptRequest) {
    for (const handler of this.handlers) {
      handler(value)
    }
  }

  use(handler: (request: InterceptRequest) => void) {
    this.handlers.push(handler)
    return this.handlers.length - 1
  }
}
