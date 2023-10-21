import { EmmlyClient } from '../client'

/**
 * Resource base class for the resources.
 */
export default class Resource {
  client: EmmlyClient

  variables: {
    sortBy?: string
    id?: string
    sortDirection?: 'ASC' | 'DESC'
    repository?: string
    type?: string
    person?: string
    pageSize?: number
    page?: number
    status?: string | string[]
    published?: boolean
    tags?: string[] | string
  }

  constructor(client: EmmlyClient) {
    this.client = client

    this.variables = {}
  }

  id(id: string) {
    this.variables.id = id
    return this
  }
}
