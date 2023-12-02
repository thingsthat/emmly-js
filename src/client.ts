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
  headers: any
  status?: number
  errors?: any
}

export type EmmlyOptions = {
  timeout: number
  headers: { [name: string]: string }
  withCredentials?: boolean
}

type QueryVeriables = {
  [key: string]: string | number | boolean | null | undefined | any
}

type RequestParams = {
  [key: string]: string | number | boolean
}

/**
 * Emmly main query class.
 */
export class EmmlyClient {
  debug = false

  options: EmmlyOptions = {
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  }

  content: (slug?: string) => ContentResource
  repository: (slug?: string) => RepositoryResource
  model: (slug?: string) => ModelResource

  interceptors: {
    request: Interceptors
    fulfilled: Interceptors
    rejected: Interceptors
  }

  url = 'https://api.emmly.co/api' // Default latest API URL

  token: string | undefined

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
      request: new Interceptors(),
      fulfilled: new Interceptors(),
      rejected: new Interceptors(),
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

  setTimeout(timeout: number) {
    this.options.timeout = timeout
  }

  setApi(url: string) {
    this.url = url
  }

  setDebug(debug: boolean) {
    this.debug = debug
  }

  getUrl() {
    return this.url
  }

  getVersion() {
    return packageAgentName
  }

  setToken(token: string) {
    if (token !== undefined && token !== null) {
      this.token = token
      this.options.headers['x-auth'] = token
    }
  }

  setHeader(name: string, value: string) {
    this.options.headers[name] = value
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

  private requiresToken() {
    if (!this.token || this.token.trim() === '') {
      throw new Error('A valid API token is required for this operation.')
    }
  }

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
          method: 'POST',
          data,
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
          method: 'PUT',
          data,
        },
        options,
      ),
    )

    this.logDebug('PUT', url, response)

    return response
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
        method: 'POST',
        data: {
          query,
          variables,
        },
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
      this.interceptors.request.forEach({ url, options })

      // Make response
      const response = await axios(url, options)

      clearTimeout(timeoutTimer)

      // Clean headers
      // End response to user
      const cleanResponse: EmmlyResponse = {
        headers: response.headers,
        status: response.status,
        data: response.data,
        errors: response.data.errors,
      }

      if (response.status >= 400) {
        throw new EmmlyResponseError(cleanResponse)
      } else {
        // Dispatch fulfilled intercepters
        this.interceptors.fulfilled.forEach({
          url,
          options,
          response: cleanResponse,
        })
      }

      return cleanResponse
    } catch (err) {
      clearTimeout(timeoutTimer)

      if ('response' in err) {
        const error = new EmmlyResponseError({
          headers: err.response.headers,
          status: err.response.status,
          data: err.response.data,
        })

        // Dispatch rejected intercepters
        this.interceptors.rejected.forEach({ url, options, error })
      }

      throw err
    }
  }

  logDebug(method: string, url: string, response: EmmlyResponse) {
    if (this.debug) {
      console.log(agentName, 'method', method)
      console.log(agentName, 'url', url)
      console.log(agentName, 'response', response)
    }
  }
}
