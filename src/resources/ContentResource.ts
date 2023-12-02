import { EmmlyClient, EmmlyResponse } from '..'

import Resource from './Resource'

/**
 * Content resource to query and filter content.
 */
export default class ContentResource extends Resource {
  constructor(client: EmmlyClient) {
    super(client)
  }

  content(slug: string): ContentResource {
    this.variables.slug = slug
    return this
  }

  repository(repositoryId: string): ContentResource {
    this.variables.repositoryId = repositoryId
    return this
  }

  person(personId: string): ContentResource {
    this.variables.personId = personId
    return this
  }

  sortBy(sortBy: string): ContentResource {
    this.variables.sortBy = sortBy
    return this
  }

  sortUp(): ContentResource {
    this.variables.sortDirection = 'ASC'
    return this
  }

  sortDown(): ContentResource {
    this.variables.sortDirection = 'DESC'
    return this
  }

  pageSize(pageSize: number): ContentResource {
    this.variables.pageSize = pageSize
    return this
  }

  page(page: number): ContentResource {
    this.variables.page = page
    return this
  }

  type(type: string): ContentResource {
    this.variables.type = type
    return this
  }

  /**
   * Get content revision by status.
   *
   * @param {string|string[]} status - Content revision status.
   */
  status(status: string | string[]): ContentResource {
    this.variables.status = status
    return this
  }

  published(): ContentResource {
    this.variables.published = true
    return this
  }

  tags(tags: string[] | string): ContentResource {
    this.variables.tags = tags
    return this
  }

  async fetch(fields: string | string[]): Promise<EmmlyResponse> {
    if (this.variables.slug) {
      const response = await this.client.query(
        `query content($slug: String!, $repositoryId: ID, $type: String) {
          content(slug: $slug, repositoryId: $repositoryId, type: $type) {
            ${Array.isArray(fields) ? fields.join(' ') : fields}
          }
        }`,
        this.variables,
      )

      return {
        data: response.data.content,
        headers: response.headers,
      }
    }

    const response = await this.client.query(
      `query contents($repositoryId: ID, $personId: ID, $sortBy: String, $sortDirection: SortDirection, $pageSize: Int, $page: Int, $type: [String], $status: [String], $published: Boolean, $tags: [String]){
        contents(repositoryId: $repositoryId, personId: $personId, sortBy: $sortBy, sortDirection: $sortDirection, pageSize: $pageSize, page: $page, type: $type, status: $status, published: $published, tags: $tags) {
          ${fields}
        }
      }`,
      this.variables,
    )

    return {
      data: response.data.contents,
      headers: response.headers,
    }
  }

  async delete(): Promise<EmmlyResponse> {
    if (!this.variables.slug) {
      throw new Error(
        'Content slug needs to be supplied before you can delete.',
      )
    }

    const response = await this.client.query(
      `mutation deleteContent($slug: String!, $repositoryId: ID) {
        deleteContent(slug: $slug, repositoryId: $repositoryId) {
          id
          name
        }
      }`,
      this.variables,
    )

    return {
      data: response.data.deleteContent,
      headers: response.headers,
    }
  }
}
