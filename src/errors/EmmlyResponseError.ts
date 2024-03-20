import { EmmlyResponse } from '../client'

/**
 * Complex response error.
 */
export class EmmlyResponseError extends Error {
  errors: any
  status: number

  /**
   * Constructor from response.
   *
   * @param {EmmlyResponse<any>} response - Response object from API request.
   */
  constructor(response: EmmlyResponse<any>) {
    const message = getErrorMessage(response)

    super(message)

    this.status = getErrorStatus(response)
    this.errors = response.errors || response.data.errors || []
  }
}

function getErrorMessage(response: EmmlyResponse<any>) {
  // Handle primary message formats
  // TOOD: Handle more than one error, but usually there's one that we can get a message from
  if (
    response.errors &&
    response.errors.length > 0 &&
    response.errors[0].message
  ) {
    return response.errors[0].message
  } else if (response.data && response.data.message) {
    return response.data.message
  }

  return 'Error'
}

function getErrorStatus(response: EmmlyResponse<any>) {
  if (
    response.errors &&
    response.errors.length > 0 &&
    response.errors[0].message
  ) {
    return response.errors[0].status
  } else if (response.data && response.data.status) {
    return response.data.status
  }

  return 200
}
