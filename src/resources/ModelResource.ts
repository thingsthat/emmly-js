import { EmmlyClient, EmmlyResponse } from '..'

import Resource from './Resource'

/**
 * Model resource to query and filter models.
 */
export default class ModelResource extends Resource {
  constructor(client: EmmlyClient) {
    super(client)
  }

  async delete(): Promise<EmmlyResponse> {
    if (!this.variables.slug) {
      throw new Error('Model ID needs to be supplied before you can delete.')
    }

    const response = await this.client.query(
      `mutation deleteModel($slug: String!, $repositorySlug: String) {
        deleteModel(slug: $slug, repositorySlug: $repositorySlug) {
          id
          name
        }
      }`,
      this.variables,
    )

    return {
      data: response.data.deleteModel,
      headers: response.headers,
    }
  }

  async fetch(fields: string | string[]): Promise<EmmlyResponse> {
    if (this.variables.slug) {
      const response = await this.client.query(
        `query model($slug: String!, $repositorySlug: String) {
          model(slug: $slug, repositorySlug: $repositorySlug) {
            ${Array.isArray(fields) ? fields.join(' ') : fields}
          }
        }`,
        this.variables,
      )

      return {
        data: response.data.model,
        headers: response.headers,
      }
    }

    const response = await this.client.query(
      `query models($repositorySlug: String) {
        models(repositorySlug: $repositorySlug) {
          ${Array.isArray(fields) ? fields.join(' ') : fields}
        }
      }`,
      this.variables,
    )

    return {
      data: response.data.models,
      headers: response.headers,
    }
  }

  model(slug: string): ModelResource {
    this.variables.slug = slug
    return this
  }

  repository(repositorySlug: string): ModelResource {
    this.variables.repositorySlug = repositorySlug
    return this
  }
}
