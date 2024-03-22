import { assert } from 'chai'
import fs from 'node:fs'

import { EmmlyClient, EmmlyUploader } from '../../src'
import { mockContent3, mockRepository } from '../mock'

export default () => {
  // NOTE: If this hangs locally, it probably means that the S3 bucket is not configured correctly on localstack

  describe('Emmly content media on default workflow', function () {
    it('should create content media for uploading an image', function (done) {
      const client = new EmmlyClient()
      const uploader = new EmmlyUploader(client)

      // @ts-ignore
      uploader.addFile(
        'test-small',
        'test-small.jpeg',
        fs.readFileSync('./test/media/test-small.jpeg'),
        'image/jpeg',
        mockRepository.id as string,
        ['defaultmedia'],
      )

      uploader.on('chunkProgress', (payload) => {
        assert.strictEqual(payload?.referenceId, 'test-small')
      })

      uploader.on('fileComplete', (payload) => {
        assert.strictEqual(payload?.referenceId, 'test-small')

        assert.isNotNull(payload?.content, 'No response object')
        assert.exists(payload?.content?.data, 'Has no data')
        assert.exists(payload?.content?.data.versions, 'Has no versions')

        assert.exists(
          payload?.content?.data.versions.primary,
          'Has no primary version',
        )
        assert.exists(
          payload?.content?.data.versions.primarywebp,
          'Has no primary webp version',
        )
        assert.exists(
          payload?.content?.data.versions.preview,
          'Has no preview version',
        )

        // Set content id for later use on another test for actions execute
        mockContent3.id = payload?.content?.id
      })

      uploader.on('uploading', () => {})

      uploader.on('complete', () => {
        done()
      })

      uploader.uploadAll()
    })

    it('should create content media for uploading an large image', function (done) {
      const client = new EmmlyClient()
      const uploader = new EmmlyUploader(client)

      // @ts-ignore
      uploader.addFile(
        'test',
        'test.jpg',
        fs.readFileSync('./test/media/test.jpg'),
        'image/jpeg',
        mockRepository.id as string,
        ['defaultmedia'],
      )

      uploader.on('chunkProgress', (payload) => {
        assert.strictEqual(payload?.referenceId, 'test')
      })

      uploader.on('fileComplete', (payload) => {
        assert.strictEqual(payload?.referenceId, 'test')

        assert.isNotNull(payload?.content, 'No response object')
        assert.exists(payload?.content?.data, 'Has no data')
        assert.exists(payload?.content?.data.versions, 'Has no versions')

        assert.exists(
          payload?.content?.data.versions.primary,
          'Has no primary version',
        )
        assert.exists(
          payload?.content?.data.versions.primarywebp,
          'Has no primary webp version',
        )
        assert.exists(
          payload?.content?.data.versions.preview,
          'Has no preview version',
        )
      })

      uploader.on('complete', () => {
        done()
      })

      uploader.upload('test')
    })

    it('should start creating content media for a large image and cancel after 5 seconds', function (done) {
      const client = new EmmlyClient()
      const uploader = new EmmlyUploader(client)

      // @ts-ignore
      uploader.addFile(
        'test',
        'test.jpg',
        fs.readFileSync('./test/media/test.jpg'),
        'image/jpeg',
        mockRepository.id as string,
        ['defaultmedia'],
      )

      uploader.on('chunkProgress', (payload) => {
        assert.strictEqual(payload?.referenceId, 'test')
      })

      uploader.on('fileComplete', (payload) => {
        assert.strictEqual(payload?.referenceId, 'test')

        assert.isNotNull(payload?.content, 'No response object')
        assert.exists(payload?.content?.data, 'Has no data')
        assert.exists(payload?.content?.data.versions, 'Has no versions')

        assert.exists(
          payload?.content?.data.versions.primary,
          'Has no primary version',
        )
        assert.exists(
          payload?.content?.data.versions.primarywebp,
          'Has no primary webp version',
        )
        assert.exists(
          payload?.content?.data.versions.preview,
          'Has no preview version',
        )
      })

      uploader.on('cancelled', () => {})

      uploader.on('complete', () => {
        done()
      })

      uploader.uploadAll()

      setTimeout(() => {
        uploader.pause('test')
      }, 3000)

      setTimeout(() => {
        uploader.resume('test')
      }, 5000)
    })
  })
}
