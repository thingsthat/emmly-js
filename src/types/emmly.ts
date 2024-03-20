import { JSONType } from './json'

/**
 * Repository is the primary data structure for where content is stored.
 */
export interface IRepository {
  id?: string
  name: string
  options: any
  primaryLanguage: string
  role?: string
}

/**
 * Workflows are used to define the status of content, enabling the ability
 * to change the status of content and attach actions to those changes.
 * This also determines in the models.
 */
export interface IWorkflow {
  id?: string
  name: string
  status: string
}

/**
 * Action is used to define the execution that can be taken on content.
 * For instance, you can have an action that resizes media on upload
 * and publish.
 */
export interface IAction {
  type: string
  id?: string
  name: string
  options: JSONType
}

/**
 * Model is used to define the structure of content and how this displayed both
 * externally and internally within the API.
 */
export interface IModel {
  id?: string
  name: string
  fields: JSONType
}

/**
 * Content is the primary data structure for where content is stored, with updates
 * stored as a history of changes separated by revision.
 */
export interface IContent {
  type?: string
  id?: string
  name?: string
  access?: string
  accessOptions?: JSONType
  aliases?: string[]
  authorContributors?: string[]
  createdAt?: Date
  createdBy?: string
  data: JSONType
  language?: string
  lastPublishedAt?: Date
  meta?: JSONType
  model?: JSONType
  parent?: string
  privateKey?: string
  published?: boolean
  publishedAt?: Date
  publishedCount?: number
  repository?: string
  revision?: IRevision
  tags?: string[]
  updatedAt?: Date
}

export interface IRevision {
  id?: string
  contentId?: string
  delta?: {
    data: any
  }
  status?: string
}
