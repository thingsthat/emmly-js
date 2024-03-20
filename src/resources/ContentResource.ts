import { EmmlyClient } from '..'
import { EmmlyResponse } from '../response'
import { IContent } from '../types/emmly'

import Resource, { SortDirection } from './Resource'

/**
 * Content resource to query and filter content.
 */
export default class ContentResource extends Resource {
  constructor(client: EmmlyClient) {
    super(client)
  }

  /**
   * Sets the slug of the content.
   * @param {string} slug - The slug of the content, this is either the name or ID.
   * @returns {ContentResource} The ContentResource instance.
   */
  content(slug: string): ContentResource {
    this.variables.slug = slug
    return this
  }

  /**
   * Deletes the content.
   * @returns {Promise<EmmlyResponse<IContent>>} Returns the API EmmlyResponse.
   * @throws {Error} - If the content slug is not supplied.
   */
  async delete(): Promise<EmmlyResponse<IContent>> {
    if (!this.variables.slug) {
      throw new Error(
        'Content slug needs to be supplied before you can delete.',
      )
    }

    const response = await this.client.query<{
      deleteContent: IContent
    }>(
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

  /**
   * Fetches the content.
   * @param {string|string[]} fields - The fields to fetch.
   * @returns {Promise<EmmlyResponse<IContent[]>>} Returns the API EmmlyResponse.
   */
  async fetch(fields: string | string[]): Promise<EmmlyResponse<IContent[]>> {
    if (this.variables.slug) {
      const response = await this.client.query<{
        content: IContent
      }>(
        `query content($slug: String!, $repositorySlug: String, $type: String) {
          content(slug: $slug, repositorySlug: $repositorySlug, type: $type) {
            ${Array.isArray(fields) ? fields.join(' ') : fields}
          }
        }`,
        this.variables,
      )

      return {
        data: [response.data.content],
        headers: response.headers,
      }
    }

    const response = await this.client.query<{
      contents: IContent[]
    }>(
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

  /**
   * Sets the page number for pagination.
   * @param {number} page - The page number.
   * @returns {ContentResource} The ContentResource instance.
   */
  page(page: number): ContentResource {
    this.variables.page = page
    return this
  }

  /**
   * Sets the page size for pagination.
   * @param {number} pageSize - The page size.
   * @returns {ContentResource} The ContentResource instance.
   */
  pageSize(pageSize: number): ContentResource {
    this.variables.pageSize = pageSize
    return this
  }

  /**
   * Sets the person ID for filtering content by person.
   * @param {string} personId - The person ID.
   * @returns {ContentResource} The ContentResource instance.
   */
  person(personId: string): ContentResource {
    this.variables.personId = personId
    return this
  }

  /**
   * Sets the published flag to true for filtering published content.
   * @returns {ContentResource} The ContentResource instance.
   */
  published(): ContentResource {
    this.variables.published = true
    return this
  }

  /**
   * Pushes the content to Emmly.
   * @param {IContent} content - The content to push.
   * @param {string|string[]} fields - The fields to fetch.
   * @returns {Promise<EmmlyResponse<IContent>>} A promise that resolves to the EmmlyResponse.
   */
  async push(
    content: IContent,
    fields: string | string[] = ['id', 'name'],
  ): Promise<EmmlyResponse<IContent>> {
    const response = await this.client.query<{
      content: IContent
    }>(
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

  /**
   * Sets the repository slug for filtering content by repository.
   * @param {string} repositorySlug - The repository slug.
   * @returns {ContentResource} The ContentResource instance.
   */
  repository(repositorySlug: string): ContentResource {
    this.variables.repositorySlug = repositorySlug
    return this
  }

  /**
   * Sets the sort by field for sorting content.
   * @param {string} sortBy - The field to sort by.
   * @returns {ContentResource} The ContentResource instance.
   */
  sortBy(sortBy: string): ContentResource {
    this.variables.sortBy = sortBy
    return this
  }

  /**
   * Sets the sort direction to descending.
   * @returns {ContentResource} The ContentResource instance.
   */
  sortDown(): ContentResource {
    this.variables.sortDirection = SortDirection.DESC
    return this
  }

  /**
   * Sets the sort direction to ascending.
   * @returns {ContentResource} The ContentResource instance.
   */
  sortUp(): ContentResource {
    this.variables.sortDirection = SortDirection.ASC
    return this
  }

  /**
   * Sets the status for filtering content by revision status.
   * @param {string|string[]} status - The content revision status.
   * @returns {ContentResource} The ContentResource instance.
   */
  status(status: string | string[]): ContentResource {
    this.variables.status = status
    return this
  }

  /**
   * Sets the tags for filtering content by tags.
   * @param {string|string[]} tags - The tags.
   * @returns {ContentResource} The ContentResource instance.
   */
  tags(tags: string | string[]): ContentResource {
    this.variables.tags = tags
    return this
  }

  /**
   * Sets the type for filtering content by type.
   * @param {string} type - The type.
   * @returns {ContentResource} The ContentResource instance.
   */
  type(type: string): ContentResource {
    this.variables.type = type
    return this
  }
}
