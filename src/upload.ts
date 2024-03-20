import axios, {
  AxiosProgressEvent,
  CancelToken,
  CancelTokenSource,
} from 'axios'
import Bottleneck from 'bottleneck'

import { EmmlyClient } from '.'

export type UploadEvent =
  | 'cancelled'
  | 'chunkProgress'
  | 'complete'
  | 'error'
  | 'fileCancelled'
  | 'fileComplete'
  | 'fileError'
  | 'filePaused'
  | 'fileReset'
  | 'fileResumed'
  | 'paused'
  | 'progress'
  | 'reset'
  | 'resumed'
  | 'uploading'

export type UploadEventPayload = {
  chunks?: { [key: string]: Chunk }
  content?: any
  error?: Error
  loaded?: number
  maxOffset?: number
  offset?: number
  referenceId: string
  total?: number
}

type Chunk = {
  cancelSource?: CancelTokenSource
  endByte: number
  isComplete?: boolean
  loaded: number
  maxOffset: number
  offset: number
  size: number
  startByte: number
  url?: string
}

type UploadEventHandler = (payload?: UploadEventPayload) => void

/**
 * Uploader for the Emmly API.
 */
export class EmmlyUploader {
  // Bytes per chunk
  chunkSize: number = 7 * 1024 * 1024
  client: EmmlyClient
  events: { [key in UploadEvent]?: UploadEventHandler[] } = {}

  files: { [key: string]: UploadFile }

  constructor(client: EmmlyClient) {
    this.files = {}
    this.events = {}
    this.client = client
  }

  /**
   * Adds a file to the uploader.
   *
   * @param {string} referenceId - The reference key for the file.
   * @param {string} name - The name of the file.
   * @param {Buffer} buffer - The buffer of the file.
   * @param {string} contentType - The content type of the file.
   * @param {string} repositorySlug - The repository Slug to upload to.
   * @param {string[]} actions  - The actions to apply to the file.
   * @param {string} parentContentId - The optional parent content ID to upload to.
   */
  addFile(
    referenceId: string,
    name: string,
    buffer: Buffer,
    contentType: string,
    repositorySlug: string,
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
      repositorySlug,
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
        endByte,
        loaded: 0,
        maxOffset,
        offset,
        size: chunkSize,
        startByte,
      })
    }

    this.files[referenceId] = file
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
   * Emits an event.
   *
   * @param {UploadEvent} event - The event to emit.
   * @param {UploadEventPayload} data - The data to emit with the event.
   */
  emit(event: UploadEvent, data?: UploadEventPayload) {
    for (const handler of this.events[event] ?? []) {
      handler(data)
    }
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
   * Adds an event handler.
   *
   * @param {UploadEvent} event - The event to add a handler for.
   * @param {Function} handler - The callback handler for the event.
   */
  on(event: UploadEvent, handler: UploadEventHandler) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event]!.push(handler)
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
   * Put request to the axios instance. This is used by the chunk uploader to upload the chunk.
   *
   * @param {string} target - The target URL.
   * @param {Buffer} body - The body of the request.
   * @param {string} contentType - The content type of the request.
   * @param {CancelToken} cancelToken - The cancel token to use.
   * @param {(progressEvent: AxiosProgressEvent) => void} onUploadProgress - The progress callback.
   */
  async put(
    target: string,
    body: Buffer,
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
   * Set the chunk size. This is used by the chunk uploader to set the chunk size.
   *
   * @param {number} chunkSize - The chunk size in bytes.
   */
  setChunkSize(chunkSize: number) {
    this.chunkSize = chunkSize
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
}

/**
 * Individual file for the uploader.
 */
export class UploadFile {
  actions: string[]
  buffer: Buffer
  chunks: { [key: string]: Chunk }
  contentType: string
  isComplete: boolean
  name: string
  parentContentId?: string
  queue?: Bottleneck
  referenceId: string
  repositorySlug: string
  size: number
  target: any
  uploader: EmmlyUploader

  constructor(
    uploader: EmmlyUploader,
    referenceId: string,
    name: string,
    buffer: Buffer,
    size: number,
    repositorySlug: string,
    contentType: string,
    actions: any,
    parentContentId?: string,
  ) {
    this.uploader = uploader
    this.referenceId = referenceId
    this.name = name
    this.buffer = buffer
    this.size = size
    this.repositorySlug = repositorySlug
    this.parentContentId = parentContentId
    this.contentType = contentType
    this.actions = actions
    this.chunks = {}

    this.target = null

    this.isComplete = false
  }

  /**
   * Add a chunk to the file.
   *
   * @param {string} key - The chunk key.
   * @param {Chunk} chunk - The chunk data to upload once ready.
   */
  addChunk(key: string, chunk: Chunk) {
    this.chunks[key] = chunk

    this.chunks[key].isComplete = false
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

  /**
   * After all chunks are done.
   */
  async complete() {
    const referenceId = this.referenceId

    try {
      const { data } = await this.uploader.client.query<{
        uploadCallback: any
      }>(
        `query uploadCallback($key: String, $contentType: String!, $name: String!, $repositorySlug: String!, $actions: [String], $chunks: JSON, $parentContentId: ID) { 
                uploadCallback(key: $key, contentType: $contentType, name: $name, repositorySlug: $repositorySlug, actions: $actions, chunks: $chunks, parentContentId: $parentContentId) {
                            id
                            name
                            data
                        }
                    }`,
        {
          name: this.name,
          actions: this.actions,
          chunks: this.chunks,
          contentType: this.contentType,
          key: this.target.key,
          parentContentId: this.parentContentId,
          repositorySlug: this.repositorySlug,
        },
      )

      const content = data.uploadCallback

      this.isComplete = true

      // Upload complete and we have our content
      this.uploader.emit('fileComplete', { content, referenceId })

      this.uploader.complete()
    } catch (error) {
      this.uploader.emit('error', { error, referenceId })
    }
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
      chunks: this.chunks,
      referenceId: this.referenceId,
    })
  }

  progress() {
    const total = this.size

    let loaded = 0

    for (const chunkKey in this.chunks) {
      loaded += this.chunks[chunkKey].loaded
    }

    this.uploader.emit('progress', {
      loaded,
      referenceId: this.referenceId,
      total,
    })
  }

  async resume() {
    this.uploader.emit('fileResumed', {
      chunks: this.chunks,
      referenceId: this.referenceId,
    })

    await this.upload()
  }

  /**
   * Upload requests a file upload from the Emmly API and then assigns the individual chunk targets
   * to the corresponding chunk.
   */
  async upload() {
    const referenceId = this.referenceId

    try {
      const response = await this.uploader.client.query<{
        upload: any
      }>(
        `query upload($repositorySlug: String!, $contentType: String!, $chunks: JSON) { 
                    upload(repositorySlug: $repositorySlug, contentType: $contentType, chunks: $chunks) {
                            url
                            key
                            chunks
                        }
                    }`,
        {
          chunks: this.chunks,
          contentType: this.contentType,
          repositorySlug: this.repositorySlug,
        },
      )

      const upload = response.data.upload

      // For each upload chunk set the chunks corresponding key and down download target
      this.target = upload
    } catch (error) {
      return this.uploader.emit('error', { error, referenceId })
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

  /**
   * Uploads a chunk to the target. We use signed S3 for this, but it could be used for any target.
   *
   * @param {string} chunkKey - The chunk key.
   */
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
          loaded,
          maxOffset,
          offset,
          referenceId,
          total,
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
      loaded: this.chunks[chunkKey].size,
      maxOffset,
      offset,
      referenceId,
      total: this.chunks[chunkKey].size,
    })

    this.progress()
  }

  /**
   * Uploads all chunks.
   */
  async uploadChunks() {
    const referenceId = this.referenceId

    this.uploader.emit('uploading', { referenceId })

    this.queue = new Bottleneck({
      maxConcurrent: 3,
    })

    try {
      // Reset chunks loaded if not complete
      for (const chunkKey in this.chunks) {
        if (!this.chunks[chunkKey].isComplete) {
          this.chunks[chunkKey].loaded = 0
        }
      }

      // Fiter chunks by what's complete and queue the rest
      const tasks = Object.keys(this.chunks)
        .filter((chunkKey) => !this.chunks[chunkKey].isComplete)
        .map(
          (chunkKey) => this.queue?.schedule(() => this.uploadChunk(chunkKey)),
        )

      await Promise.all(tasks)

      await this.complete()
    } catch (error) {
      if (error.constructor.name == 'BottleneckError') {
        return
      }

      this.uploader.emit('error', { error, referenceId })
    }
  }
}
