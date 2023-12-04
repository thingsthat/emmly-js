import { JSONType } from './json'

export interface IContent {
  type?: string
  id?: string
  name?: any
  access?: string
  accessOptions?: JSONType
  authorContributors?: string[]
  createdAt?: Date
  createdBy?: string
  data?: JSONType
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
  revision?: string
  tags?: string[]
  updatedAt?: Date
}
