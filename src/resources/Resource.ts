import { EmmlyClient } from '../client'

/**
 * Resource base class for the resources.
 */
/**
 * Represents a resource in the Emmly system.
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

  /**
   * Creates a new instance of the Resource class.
   * @param {EmmlyClient} client - The Emmly client instance.
   */
  constructor(client: EmmlyClient) {
    this.client = client

    this.variables = {}
  }

  /**
   * Sets the slug variable for the resource.
   * @param {string} slug - The slug value to set.
   * @returns {Resource} The updated Resource instance.
   */
  slug(slug: string) {
    this.variables.slug = slug
    return this
  }
}
