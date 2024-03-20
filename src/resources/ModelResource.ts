import { EmmlyClient, IModel } from '..'
import { EmmlyResponse } from '../response'

import Resource from './Resource'

/**
 * Model resource to query and filter models.
 */
export default class ModelResource extends Resource {
  constructor(client: EmmlyClient) {
    super(client)
  }

  async fetch(fields: string | string[]): Promise<EmmlyResponse<IModel[]>> {
    if (this.variables.slug) {
      const response = await this.client.query<{
        model: IModel
      }>(
        `query model($slug: String!, $repositorySlug: String) {
          model(slug: $slug, repositorySlug: $repositorySlug) {
            ${Array.isArray(fields) ? fields.join(' ') : fields}
          }
        }`,
        this.variables,
      )

      return {
        data: [response.data.model],
        headers: response.headers,
      }
    }

    const response = await this.client.query<{
      models: IModel[]
    }>(
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
