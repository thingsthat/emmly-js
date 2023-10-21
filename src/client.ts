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

  content: (id?: string) => ContentResource
  repository: (id?: string) => RepositoryResource
  model: (id?: string) => ModelResource

  interceptors: {
    request: Interceptors
    fulfilled: Interceptors
    rejected: Interceptors
  }

  url = 'https://api.emmly.co/api' // Default latest API URL

  token: string | undefined

  constructor() {
    // Resources
    this.content = (id?: string) => {
      const resource = new ContentResource(this)
      if (id) {
        resource.id(id)
      }
      return resource
    }

    this.repository = (id?: string) => {
      const resource = new RepositoryResource(this)
      if (id) {
        resource.id(id)
      }
      return resource
    }

    this.model = (id?: string) => {
      const resource = new ModelResource(this)
      if (id) {
        resource.id(id)
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
      if (process.env.UNALIKE_API_URL) {
        this.setApi(process.env.UNALIKE_API_URL)
      }
      if (process.env.UNALIKE_API_TOKEN) {
        this.setToken(process.env.UNALIKE_API_TOKEN)
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

  buildUrl(url: string, params?: RequestParams): string {
    let qs = ''

    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        const value = params[key]
        qs += `${encodeURIComponent(key)}=${encodeURIComponent(value)}&`
      }
    }

    if (qs.length > 0) {
      qs = qs.substring(0, qs.length - 1) // chop off last "&"
      url = `${url}?${qs}`
    }

    return url
  }

  requiresToken() {}

  async ping(): Promise<EmmlyResponse> {
    const response = await this.request(
      `${this.url}/ping`,
      Object.assign(this.options, {
        method: 'GET',
      }),
    )

    if (this.debug) {
      console.log(agentName, 'url', '/ping')
      console.log(agentName, 'method', 'GET')
      console.log(agentName, 'res', response)
    }

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

    if (this.debug) {
      console.log(agentName, 'url', url)
      console.log(agentName, 'method', 'GET')
      console.log(agentName, 'response', response)
    }

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

    if (this.debug) {
      console.log(agentName, 'url', url)
      console.log(agentName, 'method', 'POST')
      console.log(agentName, 'response', response)
    }

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

    if (this.debug) {
      console.log(agentName, 'url', url)
      console.log(agentName, 'method', 'PUT')
      console.log(agentName, 'response', response)
    }

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

    if (this.debug) {
      console.log(agentName, 'url', url)
      console.log(agentName, 'method', 'DELETE')
      console.log(agentName, 'response', response)
    }

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

    if (this.debug) {
      console.log(agentName, 'url', url)
      console.log(agentName, 'method', 'POST')
      console.log(agentName, 'response', response)
    }

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
}
