import { EmmlyClient, EmmlyResponse } from '..'

import Resource from './Resource'

/**
 * Model resource to query and filter models.
 */
export default class ModelResource extends Resource {
  constructor(client: EmmlyClient) {
    super(client)
  }

  model(slug: string): ModelResource {
    this.variables.slug = slug
    return this
  }

  repository(repositoryId: string): ModelResource {
    this.variables.repositoryId = repositoryId
    return this
  }

  async fetch(fields: string | string[]): Promise<EmmlyResponse> {
    if (this.variables.slug) {
      const response = await this.client.query(
        `query model($slug: String!, $respositoryId: ID) {
          model(slug: $slug, respositoryId: $respositoryId) {
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
      `query models($repositoryId: ID) {
        models(repositoryId: $repositoryId) {
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

  async delete(): Promise<EmmlyResponse> {
    if (!this.variables.slug) {
      throw new Error('Model ID needs to be supplied before you can delete.')
    }

    const response = await this.client.query(
      `mutation deleteModel($slug: String!, $repositoryId: ID) {
        deleteModel(slug: $slug, repositoryId: $repositoryId) {
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
}
