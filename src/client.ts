import 'regenerator-runtime/runtime'

import axios from 'axios'

import { EmmlyResponseError } from './errors/EmmlyResponseError'
import { Interceptors } from './intercept'
import ContentResource from './resources/ContentResource'
import ModelResource from './resources/ModelResource'
import RepositoryResource from './resources/RepositoryResource'

// We use this to set the user agent which in turn allows us to track usage of the SDK
const agentName = 'emmly-js'
const packageAgentName = `${agentName}-0.5.4`

export type EmmlyResponse = {
  data: any
  errors?: any
  headers: any
  status?: number
}

export type EmmlyOptions = {
  headers: { [name: string]: string }
  timeout: number
  withCredentials?: boolean
}

type QueryVeriables = {
  [key: string]: any | boolean | null | number | string | undefined
}

type RequestParams = {
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
   * @param {RequestParams} [params] - Optional key-value pairs representing the query parameters to be appended to the URL.
   * @returns {string} Built url.
   */
  buildUrl(url: string, params?: RequestParams): string {
    if (params && Object.keys(params).length > 0) {
      // Construct URLSearchParams directly from params
      const searchParams = new URLSearchParams(
        Object.entries(params).map(([key, value]) => [key, String(value)]),
      ).toString()

      // Simplify appending query string to URL
      return url + (url.includes('?') ? '&' : '?') + searchParams
    }

    return url
  }

  async delete(
    endpoint: string,
    params: RequestParams,
    options: Partial<EmmlyOptions>,
  ): Promise<EmmlyResponse> {
    this.requiresToken()

    const url = this.buildUrl(`${this.url}${endpoint}`, params)

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

  async get(
    endpoint: string,
    params: RequestParams,
    options?: Partial<EmmlyOptions>,
  ): Promise<EmmlyResponse> {
    const url = this.buildUrl(`${this.url}${endpoint}`, params)

    const response = await this.request(
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
  logDebug(method: string, url: string, response: EmmlyResponse) {
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
  async ping(): Promise<EmmlyResponse> {
    const response = await this.request(
      `${this.url}/ping`,
      Object.assign(this.options, {
        method: 'GET',
      }),
    )

    this.logDebug('GET', `${this.url}/ping`, response)

    return response
  }

  async post(
    endpoint: string,
    data?: Object,
    options?: Partial<EmmlyOptions>,
  ): Promise<EmmlyResponse> {
    const url = this.buildUrl(`${this.url}${endpoint}`)

    const response = await this.request(
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

  async put(
    endpoint: string,
    params: RequestParams,
    data: any,
    options: Partial<EmmlyOptions>,
  ): Promise<EmmlyResponse> {
    this.requiresToken()

    const url = this.buildUrl(`${this.url}${endpoint}`, params)

    const response = await this.request(
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
  async query(
    query: string,
    variables?: QueryVeriables,
    path = '/query',
  ): Promise<EmmlyResponse> {
    const url = this.buildUrl(`${this.url}${path}`)

    const response = await this.request(
      url,
      Object.assign({}, this.options, {
        data: {
          query,
          variables,
        },
        method: 'POST',
      }),
    )

    if (response && response.data.errors && response.data.errors.length > 0) {
      throw new EmmlyResponseError(response)
    }

    // Tidy up a little
    response.data = response.data.data

    this.logDebug('POST', url, response)

    return response
  }

  async request(
    url: string,
    options: Partial<EmmlyOptions>,
  ): Promise<EmmlyResponse> {
    // Simple timeout
    const timeoutTimer = setTimeout(() => {
      throw new Error('Request timed out')
    }, options.timeout)

    try {
      // Request options intercepters
      this.interceptors.request.forEach({ options, url })

      // Make response
      const response = await axios(url, options)

      clearTimeout(timeoutTimer)

      // Clean headers
      // End response to user
      const cleanResponse: EmmlyResponse = {
        data: response.data,
        errors: response.data.errors,
        headers: response.headers,
        status: response.status,
      }

      if (response.status >= 400) {
        throw new EmmlyResponseError(cleanResponse)
      } else {
        // Dispatch fulfilled intercepters
        this.interceptors.fulfilled.forEach({
          options,
          response: cleanResponse,
          url,
        })
      }

      return cleanResponse
    } catch (err) {
      clearTimeout(timeoutTimer)

      if ('response' in err) {
        const error = new EmmlyResponseError({
          data: err.response.data,
          headers: err.response.headers,
          status: err.response.status,
        })

        // Dispatch rejected intercepters
        this.interceptors.rejected.forEach({ error, options, url })
      }

      throw err
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
