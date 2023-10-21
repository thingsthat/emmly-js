export type Delta = {
  ops: DeltaOp[]
  penelope?: any[]
  schema?: string
}

export type DeltaOp = {
  insert: any
  attributes?: any
  type?: 'media' | 'embed' | 'divider'
}
