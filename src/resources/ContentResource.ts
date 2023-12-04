import { EmmlyClient, EmmlyResponse } from '..'
import { IContent } from '../types/content'

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

  async delete(): Promise<EmmlyResponse> {
    if (!this.variables.slug) {
      throw new Error(
        'Content slug needs to be supplied before you can delete.',
      )
    }

    const response = await this.client.query(
      `mutation deleteContent($slug: String!, $repositorySlug: String) {
        deleteContent(slug: $slug, repositorySlug: $repositorySlug) {
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

  async fetch(fields: string | string[]): Promise<EmmlyResponse> {
    if (this.variables.slug) {
      const response = await this.client.query(
        `query content($slug: String!, $repositorySlug: String, $type: String) {
          content(slug: $slug, repositorySlug: $repositorySlug, type: $type) {
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
      `query contents($repositorySlug: String, $personId: ID, $sortBy: String, $sortDirection: SortDirection, $pageSize: Int, $page: Int, $type: [String], $status: [String], $published: Boolean, $tags: [String]){
        contents(repositorySlug: $repositorySlug, personId: $personId, sortBy: $sortBy, sortDirection: $sortDirection, pageSize: $pageSize, page: $page, type: $type, status: $status, published: $published, tags: $tags) {
          ${Array.isArray(fields) ? fields.join(' ') : fields}
        }
      }`,
      this.variables,
    )

    return {
      data: response.data.contents,
      headers: response.headers,
    }
  }

  page(page: number): ContentResource {
    this.variables.page = page
    return this
  }

  pageSize(pageSize: number): ContentResource {
    this.variables.pageSize = pageSize
    return this
  }

  person(personId: string): ContentResource {
    this.variables.personId = personId
    return this
  }

  published(): ContentResource {
    this.variables.published = true
    return this
  }

  async push(
    content: IContent,
    fields: string | string[],
  ): Promise<EmmlyResponse> {
    const response = await this.client.query(
      `mutation content($repositorySlug: String, $content: JSON!) { 
        content(repositorySlug: $repositorySlug, content: $content) {
          ${Array.isArray(fields) ? fields.join(' ') : fields}
        }
      }`,
      {
        content,
        repositorySlug: this.variables.repositorySlug,
      },
    )

    return {
      data: response.data.content,
      headers: response.headers,
    }
  }

  repository(repositorySlug: string): ContentResource {
    this.variables.repositorySlug = repositorySlug
    return this
  }

  sortBy(sortBy: string): ContentResource {
    this.variables.sortBy = sortBy
    return this
  }

  sortDown(): ContentResource {
    this.variables.sortDirection = 'DESC'
    return this
  }

  sortUp(): ContentResource {
    this.variables.sortDirection = 'ASC'
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

  tags(tags: string | string[]): ContentResource {
    this.variables.tags = tags
    return this
  }

  type(type: string): ContentResource {
    this.variables.type = type
    return this
  }
}
