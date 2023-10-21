import { EmmlyClient, EmmlyResponse } from '..'

import Resource from './Resource'

/**
 * Repository resource to query and filter repositories.
 */
export default class RepositoryResource extends Resource {
  constructor(client: EmmlyClient) {
    super(client)
  }

  repository(repository: string): RepositoryResource {
    this.variables.repository = repository
    return this
  }

  sortBy(sortBy: string): RepositoryResource {
    this.variables.sortBy = sortBy
    return this
  }

  sortUp(): RepositoryResource {
    this.variables.sortDirection = 'ASC'
    return this
  }

  sortDown(): RepositoryResource {
    this.variables.sortDirection = 'DESC'
    return this
  }

  /**
   * Fetch repository or repositories if no repository id is set.
   *
   * @param {string | string[]} fields - Repository fields to fetch.
   * @returns {EmmlyResponse} - Response from Emmly.
   */
  async fetch(fields: string | string[]): Promise<EmmlyResponse> {
    if (this.variables.id) {
      const response = await this.client.query(
        `query repository($slug: String) {
                repository(slug: $slug) {
                    ${Array.isArray(fields) ? fields.join(' ') : fields}
                }
            }`,
        {
          slug: this.variables.id,
        },
      )

      return {
        data: response.data.repository,
        headers: response.headers,
      }
    }

    const variables = {
      sortBy: this.variables.sortBy,
      sortDirection: this.variables.sortDirection,
    }

    const response = await this.client.query(
      `query repositories($sortBy: String, $sortDirection: SortDirection) { 
            repositories(sortBy: $sortBy, sortDirection: $sortDirection) { 
                ${fields}
            }
        }`,
      variables,
    )

    return {
      data: response.data.repositories,
      headers: response.headers,
    }
  }
}
