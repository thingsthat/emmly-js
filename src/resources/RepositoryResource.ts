import { EmmlyClient, EmmlyResponse } from '..'

import Resource from './Resource'

/**
 * Repository resource to query and filter repositories.
 */
export default class RepositoryResource extends Resource {
  constructor(client: EmmlyClient) {
    super(client)
  }

  /**
   * Fetch repository or repositories if no repository id is set.
   * @param {string | string[]} fields - Repository fields to fetch.
   * @returns {Promise<EmmlyResponse>} - Response from Emmly.
   */
  async fetch(fields: string | string[]): Promise<EmmlyResponse> {
    if (this.variables.slug) {
      const response = await this.client.query(
        `query repository($slug: String) {
          repository(slug: $slug) {
            ${Array.isArray(fields) ? fields.join(' ') : fields}
          }
        }`,
        this.variables,
      )

      return {
        data: response.data.repository,
        headers: response.headers,
      }
    }

    const response = await this.client.query(
      `query repositories($sortBy: String, $sortDirection: SortDirection) { 
        repositories(sortBy: $sortBy, sortDirection: $sortDirection) { 
          ${Array.isArray(fields) ? fields.join(' ') : fields}
        }
      }`,
      this.variables,
    )

    return {
      data: response.data.repositories,
      headers: response.headers,
    }
  }

  /**
   * Set the repository slug.
   * @param {string} slug - The repository slug.
   * @returns {RepositoryResource} - The RepositoryResource instance.
   */
  repository(slug: string): RepositoryResource {
    this.variables.slug = slug
    return this
  }

  /**
   * Set the sort by field.
   * @param {string} sortBy - The field to sort by.
   * @returns {RepositoryResource} - The RepositoryResource instance.
   */
  sortBy(sortBy: string): RepositoryResource {
    this.variables.sortBy = sortBy
    return this
  }

  /**
   * Set the sort direction to descending.
   * @returns {RepositoryResource} - The RepositoryResource instance.
   */
  sortDown(): RepositoryResource {
    this.variables.sortDirection = 'DESC'
    return this
  }

  /**
   * Set the sort direction to ascending.
   *
   * @returns {RepositoryResource} - The RepositoryResource instance.
   */
  sortUp(): RepositoryResource {
    this.variables.sortDirection = 'ASC'
    return this
  }
}
