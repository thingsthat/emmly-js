import { EmmlyClient } from '../client'

/**
 * Resource base class for the resources.
 */
export default class Resource {
  client: EmmlyClient

  variables: {
    type?: string
    page?: number
    pageSize?: number
    personId?: string
    published?: boolean
    repositorySlug?: string
    slug?: string
    sortBy?: string
    sortDirection?: 'ASC' | 'DESC'
    status?: string | string[]
    tags?: string | string[]
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
