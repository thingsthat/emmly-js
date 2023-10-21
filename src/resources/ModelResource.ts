import { EmmlyClient, EmmlyResponse } from '..'

import Resource from './Resource'

/**
 * Model resource to query and filter models.
 */
export default class ModelResource extends Resource {
  constructor(client: EmmlyClient) {
    super(client)
  }

  repository(repository: string): ModelResource {
    this.variables.repository = repository
    return this
  }

  sortBy(sortBy: string): ModelResource {
    this.variables.sortBy = sortBy
    return this
  }

  sortUp(): ModelResource {
    this.variables.sortDirection = 'ASC'
    return this
  }

  sortDown(): ModelResource {
    this.variables.sortDirection = 'DESC'
    return this
  }

  pageSize(pageSize: number): ModelResource {
    this.variables.pageSize = pageSize
    return this
  }

  page(page: number): ModelResource {
    this.variables.page = page
    return this
  }

  status(status: string): ModelResource {
    this.variables.status = status
    return this
  }

  async fetch(fields: string | string[]): Promise<EmmlyResponse> {
    if (this.variables.id) {
      const variables = {
        id: this.variables.id,
      }

      const response = await this.client.query(
        `query model($id: ID!) {
                model(id: $id) {
                    ${Array.isArray(fields) ? fields.join(' ') : fields}
                }
            }`,
        variables,
      )

      return {
        data: response.data.model,
        headers: response.headers,
      }
    }

    const variables = {
      repositoryId: this.variables.repository,
    }

    const response = await this.client.query(
      `query models($repositoryId: ID) {
            models(repositoryId: $repositoryId) {
                ${Array.isArray(fields) ? fields.join(' ') : fields}
            }
        }`,
      variables,
    )

    return {
      data: response.data.models,
      headers: response.headers,
    }
  }

  async delete(): Promise<EmmlyResponse> {
    if (!this.variables.id) {
      throw new Error('Model ID needs to be supplied before you can delete.')
    }

    const variables = {
      modelId: this.variables.id,
    }

    const response = await this.client.query(
      `mutation deleteModel($modelId: ID!) {
            deleteModel(modelId: $modelId) {
                id
                name
            }
        }`,
      variables,
    )

    return {
      data: response.data.deleteModel,
      headers: response.headers,
    }
  }
}
