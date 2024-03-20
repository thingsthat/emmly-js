export interface EmmlyResponseErrorLine {
  message: string
  status: number
}

interface DefaultEmmlyResponseData {
  errors?: EmmlyResponseErrorLine[]
  message?: string
  status?: number
}

interface EmmlyResponseMetadata {
  errors?: EmmlyResponseErrorLine[] // Consider using a more specific type for errors
  headers: { [name: string]: boolean | null | number | string | string[] }
  status?: number
}

// Define EmmlyResponse to include both the data of type T and the metadata
export type EmmlyResponse<T = DefaultEmmlyResponseData> = {
  data: T
} & EmmlyResponseMetadata
