import 'regenerator-runtime/runtime'

export * from './types/delta'
export * from './types/emmly'
export * from './errors/EmmlyResponseError'
export * from './upload'
export * from './helpers'

import axios, { AxiosResponse } from 'axios'

import { EmmlyResponseError } from './errors/EmmlyResponseError'
import { Interceptors } from './intercept'
import ContentResource from './resources/ContentResource'
import ModelResource from './resources/ModelResource'
import RepositoryResource from './resources/RepositoryResource'
import { EmmlyResponse } from './response'

// We use this to set the user agent which in turn allows us to track usage of the SDK
const agentName = 'emmly-js'
const packageAgentName = `${agentName}-0.9.3`

export type EmmlyOptions = {
  headers: { [name: string]: string }
  timeout: number
  withCredentials?: boolean
}

type QueryVeriables = {
  [key: string]: boolean | null | number | string | undefined | unknown
}

type RequestParameters = {
  [key: string]: boolean | number | string
}

/**
 * Emmly main query class.
 */
export class EmmlyClient {
  content: (slug?: string) => ContentResource

  debug = false

  interceptors: {
    fulfilled: Interceptors
    rejected: Interceptors
    request: Interceptors
  }
  model: (slug?: string) => ModelResource
  options: EmmlyOptions = {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    timeout: 10000,
  }

  repository: (slug?: string) => RepositoryResource

  token: string | undefined // Default latest API URL

  url = 'https://api.emmly.co/api'

  constructor() {
    // Resources
    this.content = (slug?: string) => {
      const resource = new ContentResource(this)
      if (slug) {
        resource.slug(slug)
      }
      return resource
    }

    this.repository = (slug?: string) => {
      const resource = new RepositoryResource(this)
      if (slug) {
        resource.slug(slug)
      }
      return resource
    }

    this.model = (slug?: string) => {
      const resource = new ModelResource(this)
      if (slug) {
        resource.slug(slug)
      }
      return resource
    }

    // Interceptors
    this.interceptors = {
      fulfilled: new Interceptors(),
      rejected: new Interceptors(),
      request: new Interceptors(),
    }

    // Set environment if we have environment variables
    if (typeof process === 'object') {
      if (process.env.EMMLY_API_URL) {
        this.setApi(process.env.EMMLY_API_URL)
      }
      if (process.env.EMMLY_API_TOKEN) {
        this.setToken(process.env.EMMLY_API_TOKEN)
      }
    }
  }

  private createEmmlyResponse<T>(
    axiosResponse: AxiosResponse,
  ): EmmlyResponse<T> {
    const emmlyResponse: EmmlyResponse<T> = {
      data: axiosResponse.data.data || axiosResponse.data,
      errors: axiosResponse.data.errors,
      headers: {},
      status: axiosResponse.status,
    }

    // Iterate over Axios response headers and assign them to emmlyResponse.headers
    for (const [key, value] of Object.entries(axiosResponse.headers)) {
      emmlyResponse.headers[key] = value
    }

    return emmlyResponse
  }

  /**
   * Check if a valid API token is set.
   */
  private requiresToken() {
    if (!this.token || this.token.trim() === '') {
      throw new Error('A valid API token is required for this operation.')
    }
  }

  /**
   * Build URL by appending query parameters to it.
   *
   * @param {string} url - Base URL of the request.
   * @param {RequestParameters} parameters - Optional key-value pairs representing the query parameters to be appended to the URL.
   * @returns {string} Built url.
   */
  buildUrl(url: string, parameters?: RequestParameters): string {
    if (parameters && Object.keys(parameters).length > 0) {
      // Construct URLSearchParams directly from params
      const searchParameters = new URLSearchParams(
        Object.entries(parameters).map(([key, value]) => [key, String(value)]),
      ).toString()

      // Simplify appending query string to URL
      return url + (url.includes('?') ? '&' : '?') + searchParameters
    }

    return url
  }

  async delete(
    endpoint: string,
    parameters: RequestParameters,
    options: Partial<EmmlyOptions>,
  ): Promise<EmmlyResponse<any>> {
    this.requiresToken()

    const url = this.buildUrl(`${this.url}${endpoint}`, parameters)

    const response = await this.request(
      url,
      Object.assign(
        {},
        this.options,
        {
          method: 'DELETE',
        },
        options,
      ),
    )

    this.logDebug('DELETE', url, response)

    return response
  }

  async get<T = unknown>(
    endpoint: string,
    parameters: RequestParameters,
    options?: Partial<EmmlyOptions>,
  ): Promise<EmmlyResponse<T>> {
    const url = this.buildUrl(`${this.url}${endpoint}`, parameters)

    const response = await this.request<T>(
      url,
      Object.assign(
        {},
        this.options,
        {
          method: 'GET',
        },
        options,
      ),
    )

    this.logDebug('GET', url, response)

    return response
  }

  getUrl() {
    return this.url
  }

  getVersion() {
    return packageAgentName
  }

  /**
   * Log debug information including the method, URL, and response if the debug flag is enabled.
   * @param {string} method - The method parameter.
   * @param {string} url - The URL of the request being made.
   * @param {EmmlyResponse} response - The EmmlyResponse response.
   */
  logDebug(method: string, url: string, response: EmmlyResponse<any>) {
    if (this.debug) {
      console.log(agentName, 'method', method)
      console.log(agentName, 'url', url)
      console.log(agentName, 'response', response)
    }
  }

  /**
   * Ping the Emmly API to check if it is up and running.
   *
   * @returns {Promise<EmmlyResponse>} A Promise that resolves to an EmmlyResponse object.
   */
  async ping(): Promise<
    EmmlyResponse<{
      name: string
      version: string
    }>
  > {
    const response = await this.request<{
      name: string
      version: string
    }>(
      `${this.url}/ping`,
      Object.assign(this.options, {
        method: 'GET',
      }),
    )

    this.logDebug('GET', `${this.url}/ping`, response)

    return response
  }

  async post<T = unknown>(
    endpoint: string,
    data?: Object,
    options?: Partial<EmmlyOptions>,
  ): Promise<EmmlyResponse<T>> {
    const url = this.buildUrl(`${this.url}${endpoint}`)

    const response = await this.request<T>(
      url,
      Object.assign(
        {},
        this.options,
        {
          data,
          method: 'POST',
        },
        options,
      ),
    )

    this.logDebug('POST', url, response)

    return response
  }

  async put<T = unknown>(
    endpoint: string,
    parameters: RequestParameters,
    data: unknown,
    options: Partial<EmmlyOptions>,
  ): Promise<EmmlyResponse<T>> {
    this.requiresToken()

    const url = this.buildUrl(`${this.url}${endpoint}`, parameters)

    const response = await this.request<T>(
      url,
      Object.assign(
        {},
        this.options,
        {
          data,
          method: 'PUT',
        },
        options,
      ),
    )

    this.logDebug('PUT', url, response)

    return response
  }

  // Main queries
  async query<T = any>(
    query: string,
    variables?: QueryVeriables,
    path = '/query',
  ): Promise<EmmlyResponse<T>> {
    const url = this.buildUrl(`${this.url}${path}`)

    const response = await this.request<T>(
      url,
      Object.assign({}, this.options, {
        data: {
          query,
          variables,
        },
        method: 'POST',
      }),
    )
    if (response.errors && response.errors.length > 0) {
      throw new EmmlyResponseError(response)
    }

    this.logDebug('POST', url, response)

    return response
  }

  async request<T = any>(
    url: string,
    options: Partial<EmmlyOptions>,
  ): Promise<EmmlyResponse<T>> {
    // Simple timeout
    const timeoutTimer = setTimeout(() => {
      throw new Error('Request timed out')
    }, options.timeout)

    try {
      // Request options intercepters
      this.interceptors.request.each({ options, url })

      // Make response
      const response = await axios(url, options)

      clearTimeout(timeoutTimer)

      // Clean emmly response
      const cleanResponse = this.createEmmlyResponse<T>(response)

      if (response.status >= 400) {
        throw new EmmlyResponseError(cleanResponse)
      } else {
        // Dispatch fulfilled intercepters
        this.interceptors.fulfilled.each({
          options,
          response: cleanResponse,
          url,
        })
      }

      return cleanResponse
    } catch (error) {
      clearTimeout(timeoutTimer)

      if ('response' in error) {
        const responseError = new EmmlyResponseError({
          data: error.response.data,
          headers: error.response.headers,
          status: error.response.status,
        })

        // Dispatch rejected intercepters
        this.interceptors.rejected.each({ error: responseError, options, url })
      }

      throw error
    }
  }

  setApi(url: string) {
    this.url = url
  }

  setDebug(debug: boolean) {
    this.debug = debug
  }

  /**
   * Set a header to be sent with every request.
   * @param {string} name - The key name of the header.
   * @param {string} value - The value of the header.
   */
  setHeader(name: string, value: string) {
    this.options.headers[name] = value
  }

  /**
   * Set timeout to be used in seconds.
   * @param {number} timeout - The number of seconds.
   */
  setTimeout(timeout: number) {
    this.options.timeout = timeout
  }

  /**
   * Set the API token to be sent with every request.
   *
   * @param {string} token - The API token.
   */
  setToken(token: string) {
    if (token !== undefined && token !== null) {
      this.token = token
      this.options.headers['x-auth'] = token
    }
  }
}
