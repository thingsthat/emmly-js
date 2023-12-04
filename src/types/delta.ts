export type Delta = {
  ops: DeltaOp[]
  schema?: string
}

export type DeltaOp = {
  type?: 'divider' | 'embed' | 'media'
  attributes?: any
  insert: any
}
