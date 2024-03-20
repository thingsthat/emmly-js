import axios from 'axios'

import { EmmlyUploader } from './upload'

import { EmmlyClient } from './'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

class MockEmmlyClient {}

describe('EmmlyUploader', () => {
  let uploader: EmmlyUploader
  let fileBuffer: Buffer
  const repositorySlug = 'repo123'
  const contentType = 'image/jpeg'
  const actions = ['action1', 'action2']

  beforeEach(() => {
    const mockClient = new MockEmmlyClient()
    uploader = new EmmlyUploader(mockClient as EmmlyClient) // Using the mocked EmmlyClient
    fileBuffer = Buffer.from('some file data')
    mockedAxios.put.mockResolvedValue({ status: 200 }) // Mock axios.put response
  })

  test('addFile should create file and chunks correctly', () => {
    uploader.addFile(
      'file1',
      'image.jpg',
      fileBuffer,
      contentType,
      repositorySlug,
      actions,
    )

    expect(uploader.files['file1']).toBeDefined()
    expect(Object.keys(uploader.files['file1'].chunks).length).toBeGreaterThan(
      0,
    )
  })

  test('emit should call event handlers', () => {
    const mockHandler = jest.fn()
    uploader.on('progress', mockHandler)

    uploader.emit('progress', { loaded: 100, referenceId: 'file1', total: 500 })

    expect(mockHandler).toHaveBeenCalledWith({
      loaded: 100,
      referenceId: 'file1',
      total: 500,
    })
  })

  test('upload should handle errors', async () => {
    uploader.addFile(
      'file1',
      'image.jpg',
      fileBuffer,
      contentType,
      repositorySlug,
      actions,
    )
    const errorHandler = jest.fn()
    uploader.on('error', errorHandler)

    mockedAxios.put.mockRejectedValue(new Error('Network error'))

    await uploader.upload('file1')

    expect(errorHandler).toHaveBeenCalled()
  })

  test('pause should stop the upload process', async () => {
    uploader.addFile(
      'file1',
      'image.jpg',
      fileBuffer,
      contentType,
      repositorySlug,
      actions,
    )
    const file = uploader.files['file1']

    // Mock chunk upload
    mockedAxios.put.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ status: 200 }), 1000),
        ),
    )

    // Start upload in background
    const uploadPromise = uploader.upload('file1')

    // Pause shortly after starting
    setTimeout(() => uploader.pause('file1'), 500)

    await uploadPromise

    // Verify that not all chunks have been uploaded
    const uploadedChunks = Object.values(file.chunks).filter(
      (chunk) => chunk.isComplete,
    ).length
    expect(uploadedChunks).toBeLessThan(Object.keys(file.chunks).length)
  })
})
