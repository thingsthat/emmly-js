import { EmmlyResponse } from '../client'

/**
 * Complex response error.
 */
export class EmmlyResponseError extends Error {
  status: number
  errors: any

  /**
   * Constructor from response.
   *
   * @param {EmmlyResponse} response - Response object from API request.
   */
  constructor(response: EmmlyResponse) {
    let message = 'Error'

    // Handle primary message formats
    if (response.data && response.data.message) {
      message = response.data.message
      // Handle graph errors, as there might be more than one, but usually there's one that we can get a message from
    } else if (
      response.data.errors &&
      response.data.errors.length > 0 &&
      response.data.errors[0].message
    ) {
      message = response.data.errors[0].message
    }

    super(message)

    this.status = response.status || 0
    this.errors = response.data.errors || []
  }
}
