export type Delta = {
  ops: DeltaOp[]
  schema?: string
}

export type DeltaOp = {
  insert: any
  attributes?: any
  type?: 'media' | 'embed' | 'divider'
}
