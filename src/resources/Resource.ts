import { EmmlyClient } from '../client'

/**
 * Resource base class for the resources.
 */
export default class Resource {
  client: EmmlyClient

  variables: {
    sortBy?: string
    slug?: string
    sortDirection?: 'ASC' | 'DESC'
    repositoryId?: string
    type?: string
    personId?: string
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

  slug(slug: string) {
    this.variables.slug = slug
    return this
  }
}
