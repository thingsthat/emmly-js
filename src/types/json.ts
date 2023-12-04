export type JSONType =
  | { [x: string]: JSONType }
  | Array<JSONType>
  | Array<string>
  | boolean
  | number
  | string
