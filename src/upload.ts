import axios, {
  AxiosProgressEvent,
  CancelToken,
  CancelTokenSource,
} from 'axios'
import Bottleneck from 'bottleneck'

import { EmmlyClient } from '.'

export type UploadEvent =
  | 'complete'
  | 'resumed'
  | 'paused'
  | 'cancelled'
  | 'progress'
  | 'error'
  | 'reset'
  | 'uploading'
  | 'fileComplete'
  | 'chunkProgress'
  | 'chunkComplete'
  | 'fileResumed'
  | 'filePaused'
  | 'fileCancelled'
  | 'fileError'
  | 'fileReset'

export type UploadEventPayload = {
  referenceId: string
  content?: any
  loaded?: number
  total?: number
  maxOffset?: number
  offset?: number
}

type Chunk = {
  offset: number
  maxOffset: number
  startByte: number
  endByte: number
  size: number
  isComplete?: boolean
  loaded: number
  url?: string
  cancelSource?: CancelTokenSource
}

/**
 * Uploader for the Emmly API.
 */
export class EmmlyUploader {
  files: { [key: string]: UploadFile }
  events: { [key: string]: Function[] }
  client: EmmlyClient

  // Bytes per chunk
  chunkSize: number = 7 * 1024 * 1024

  constructor(client: EmmlyClient) {
    this.files = {}
    this.events = {}
    this.client = client
  }

  /**
   * Sets the client to use for the uploader.
   *
   * @param {*} client - The client to use for the uploader.
   */
  setClient(client: EmmlyClient) {
    this.client = client
  }

  /**
   * Checks if there are uploads.
   *
   * @returns {boolean} - True if there are uploads, false otherwise.
   */
  hasUploads() {
    return Object.keys(this.files).length > 0
  }

  /**
   * Adds a file to the uploader.
   *
   * @param {*} referenceId - The reference key for the file.
   * @param {*} name - The name of the file.
   * @param {*} buffer - The buffer of the file.
   * @param {*} contentType - The content type of the file.
   * @param {*} repositoryId - The repository ID to upload to.
   * @param {*} actions  - The actions to apply to the file.
   * @param {*} parentContentId - The optional parent content ID to upload to.
   */
  addFile(
    referenceId: string,
    name: string,
    buffer: Buffer,
    contentType: string,
    repositoryId: string,
    actions: string[],
    parentContentId?: string,
  ) {
    const size = Buffer.byteLength(buffer)
    const file = new UploadFile(
      this,
      referenceId,
      name,
      buffer,
      size,
      repositoryId,
      contentType,
      actions,
      parentContentId,
    )
    const maxOffset = Math.max(Math.ceil(size / this.chunkSize), 1)

    // Create chunks
    for (let offset = 0; offset < maxOffset; offset++) {
      const startByte = offset * this.chunkSize
      const endByte = Math.min(size, (offset + 1) * this.chunkSize)
      const chunkSize = endByte - startByte

      const chunkKey = `${offset}_${maxOffset}`

      file.addChunk(chunkKey, {
        offset,
        maxOffset,
        startByte,
        endByte,
        size: chunkSize,
        loaded: 0,
      })
    }

    this.files[referenceId] = file
  }

  /**
   * Begins uploading a file.
   *
   * @param {string} referenceId - The reference key for the file.
   */
  async upload(referenceId: string) {
    const file = this.files[referenceId]

    if (!file.isComplete) {
      await file.upload()
    }
  }

  /**
   * Begins uploading all files.
   */
  uploadAll() {
    for (const referenceId of Object.keys(this.files)) {
      this.upload(referenceId)
    }
  }

  /**
   * Checks if all files have completed. If they have, then emit completed.
   */
  complete() {
    for (const file of Object.values(this.files)) {
      if (!file.isComplete) {
        return
      }
    }

    this.emit('complete')
  }

  /**
   * Resumes a file upload.
   *
   * @param {string} referenceId - The reference key for the file.
   */
  async resume(referenceId: string) {
    const file = this.files[referenceId]

    if (!file.isComplete) {
      await file.resume()
    }
  }

  /**
   * Resumes all file uploads.
   */
  resumeAll() {
    for (const referenceId of Object.keys(this.files)) {
      this.resume(referenceId)
    }

    this.emit('resumed')
  }

  /**
   * Pauses a file upload.
   *
   * @param {string} referenceId - The reference key for the file.
   */
  async pause(referenceId: string) {
    const file = this.files[referenceId]

    if (!file.isComplete) {
      await file.pause()
    }
  }

  /**
   * Pauses all file uploads.
   */
  pauseAll() {
    for (const referenceId of Object.keys(this.files)) {
      this.pause(referenceId)
    }

    this.emit('paused')
  }

  /**
   * Cancels a file upload.
   *
   * @param {string} referenceId - The reference key for the file.
   */
  async cancel(referenceId: string) {
    const file = this.files[referenceId]

    if (!file.isComplete) {
      await file.cancel()
    }
  }

  /**
   * Cancels all file uploads.
   */
  cancelAll() {
    for (const referenceId of Object.keys(this.files)) {
      this.cancel(referenceId)
    }

    this.emit('cancelled')
  }

  /**
   * Removes a file from the uploader.
   *
   * @param {string} referenceId - The reference key for the file.
   */
  remove(referenceId: string) {
    this.cancel(referenceId)

    delete this.files[referenceId]
  }

  /**
   * Resets the uploader.
   */
  reset() {
    for (const referenceId of Object.keys(this.files)) {
      this.remove(referenceId)
    }

    this.emit('cancelled')
    this.emit('reset')
  }

  /**
   * Adds an event handler.
   *
   * @param {UploadEvent} event - The event to add a handler for.
   * @param {Function} handler - The callback handler for the event.
   */
  on(event: UploadEvent, handler: Function) {
    if (!(event in this.events)) {
      this.events[event] = []
    }

    this.events[event].push(handler)
  }

  /**
   * Emits an event.
   *
   * @param {UploadEvent} event - The event to emit.
   * @param {any} data - The data to emit with the event.
   */
  emit(event: UploadEvent, data?: any) {
    if (event in this.events) {
      for (const handler of this.events[event]) {
        handler(data)
      }
    }
  }

  /**
   * Put request to the axios instance. This is used by the chunk uploader to upload the chunk.
   *
   * @param {string} target - The target URL.
   * @param {any} body - The body of the request.
   * @param {string} contentType - The content type of the request.
   * @param {CancelToken} cancelToken - The cancel token to use.
   * @param {(progressEvent: AxiosProgressEvent) => void} onUploadProgress - The progress callback.
   */
  async put(
    target: string,
    body: any,
    contentType: string,
    cancelToken: CancelToken,
    onUploadProgress: (progressEvent: AxiosProgressEvent) => void,
  ) {
    await axios.put(target, body, {
      cancelToken,
      headers: {
        'Content-Type': contentType,
      },
      onUploadProgress,
    })
  }

  /**
   * Set the chunk size. This is used by the chunk uploader to set the chunk size.
   *
   * @param {number} chunkSize - The chunk size in bytes.
   */
  setChunkSize(chunkSize: number) {
    this.chunkSize = chunkSize
  }
}

export class UploadFile {
  uploader: EmmlyUploader
  referenceId: string
  name: string
  buffer: Buffer
  size: number
  repositoryId: string
  parentContentId?: string
  contentType: string
  actions: string[]
  chunks: { [key: string]: Chunk }
  isComplete: boolean
  queue?: Bottleneck
  target: any

  constructor(
    uploader: EmmlyUploader,
    referenceId: string,
    name: string,
    buffer: Buffer,
    size: number,
    repositoryId: string,
    contentType: string,
    actions: any,
    parentContentId?: string,
  ) {
    this.uploader = uploader
    this.referenceId = referenceId
    this.name = name
    this.buffer = buffer
    this.size = size
    this.repositoryId = repositoryId
    this.parentContentId = parentContentId
    this.contentType = contentType
    this.actions = actions
    this.chunks = {}

    this.target = null

    this.isComplete = false
  }

  async upload() {
    const referenceId = this.referenceId

    try {
      const response = await this.uploader.client.query(
        `query upload($repositoryId: ID!, $contentType: String!, $chunks: JSON) { 
                    upload(repositoryId: $repositoryId, contentType: $contentType, chunks: $chunks) {
                            url
                            key
                            chunks
                        }
                    }`,
        {
          repositoryId: this.repositoryId,
          contentType: this.contentType,
          chunks: this.chunks,
        },
      )

      const upload = response.data.upload

      // For each upload chunk set the chunks corresponding key and down download target
      this.target = upload
    } catch (error) {
      return this.uploader.emit('error', { referenceId, error })
    }

    for (const chunkKey in this.chunks) {
      if (!this.chunks[chunkKey].isComplete) {
        this.chunks[chunkKey] = Object.assign(
          this.chunks[chunkKey],
          this.target.chunks[chunkKey],
        )
      }
    }

    await this.uploadChunks()
  }

  async uploadChunks() {
    const referenceId = this.referenceId

    this.uploader.emit('uploading', { referenceId })

    try {
      this.queue = new Bottleneck({
        maxConcurrent: 3,
      })

      // Reset chunks loaded if not complete
      for (const chunkKey in this.chunks) {
        if (!this.chunks[chunkKey].isComplete) {
          this.chunks[chunkKey].loaded = 0
        }
      }

      // Fiter chunks by what's complete and queue the rest
      const tasks = Object.keys(this.chunks)
        .filter((chunkKey) => !this.chunks[chunkKey].isComplete)
        .map((chunkKey) =>
          this.queue?.schedule(() => this.uploadChunk(chunkKey)),
        )

      await Promise.all(tasks)

      await this.complete()
    } catch (error) {
      if (error.constructor.name == 'BottleneckError') {
        return
      }

      this.uploader.emit('error', { referenceId, error })
    }
  }

  /**
   * After all chunks are done.
   */
  async complete() {
    const referenceId = this.referenceId

    try {
      const { data } = await this.uploader.client.query(
        `query uploadCallback($key: String, $contentType: String!, $name: String!, $repositoryId: ID!, $actions: [String], $chunks: JSON, $parentContentId: ID) { 
                uploadCallback(key: $key, contentType: $contentType, name: $name, repositoryId: $repositoryId, actions: $actions, chunks: $chunks, parentContentId: $parentContentId) {
                            id
                            name
                            data
                        }
                    }`,
        {
          key: this.target.key,
          contentType: this.contentType,
          name: this.name,
          repositoryId: this.repositoryId,
          actions: this.actions,
          parentContentId: this.parentContentId,
          chunks: this.chunks,
        },
      )

      const content = data.uploadCallback

      this.isComplete = true

      // Upload complete and we have our content
      this.uploader.emit('fileComplete', { referenceId, content })

      this.uploader.complete()
    } catch (error) {
      this.uploader.emit('error', { referenceId, error })
    }
  }

  addChunk(key: string, chunk: Chunk) {
    this.chunks[key] = chunk

    this.chunks[key].isComplete = false
  }

  add(key: string, chunk: Chunk) {
    this.chunks[key] = chunk
  }

  async uploadChunk(chunkKey: string) {
    const slice = this.buffer.subarray(
      this.chunks[chunkKey].startByte,
      this.chunks[chunkKey].endByte,
    )
    const referenceId = this.referenceId

    const cancelToken = axios.CancelToken
    const cancelSource = cancelToken.source()

    this.chunks[chunkKey].cancelSource = cancelSource

    await this.uploader.put(
      this.chunks[chunkKey].url || '',
      slice,
      this.contentType,
      cancelSource.token,
      (progressEvent: AxiosProgressEvent) => {
        const loaded = progressEvent.loaded
        const total = progressEvent.total
        const offset = this.chunks[chunkKey].offset
        const maxOffset = this.chunks[chunkKey].maxOffset

        this.uploader.emit('chunkProgress', {
          referenceId,
          loaded,
          total,
          maxOffset,
          offset,
        })

        this.chunks[chunkKey].loaded = loaded

        this.progress()
      },
    )

    this.chunks[chunkKey].isComplete = true
    this.chunks[chunkKey].loaded = this.chunks[chunkKey].size

    const offset = this.chunks[chunkKey].offset
    const maxOffset = this.chunks[chunkKey].maxOffset

    this.uploader.emit('chunkProgress', {
      referenceId,
      loaded: this.chunks[chunkKey].size,
      total: this.chunks[chunkKey].size,
      maxOffset,
      offset,
    })

    this.progress()
  }

  progress() {
    const total = this.size

    let loaded = 0

    for (const chunkKey in this.chunks) {
      loaded += this.chunks[chunkKey].loaded
    }

    this.uploader.emit('progress', {
      referenceId: this.referenceId,
      loaded,
      total,
    })
  }

  async resume() {
    this.uploader.emit('fileResumed', {
      referenceId: this.referenceId,
      chunks: this.chunks,
    })

    await this.upload()
  }

  async pause() {
    // Cancel requests
    for (const chunkKey in this.chunks) {
      if ('cancelSource' in this.chunks[chunkKey]) {
        this.chunks[chunkKey].cancelSource?.cancel()
      }
    }

    // Stop the queue
    if (this.queue) {
      await this.queue.stop()
    }

    this.uploader.emit('filePaused', {
      referenceId: this.referenceId,
      chunks: this.chunks,
    })
  }

  /**
   * Cancel the queue and don't save informaiton.
   */
  async cancel() {
    // Stop the queue
    if (this.queue) {
      this.queue.stop()
    }

    // Cancel requests
    for (const chunkKey in this.chunks) {
      const chunk = this.chunks[chunkKey]

      if ('cancelSource' in chunk) {
        chunk.cancelSource?.cancel()
      }
    }

    this.isComplete = true

    this.uploader.emit('fileCancelled', { referenceId: this.referenceId })
  }
}
