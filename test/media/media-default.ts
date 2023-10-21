import { assert } from 'chai'
import fs from 'fs'

import { EmmlyClient, EmmlyUploader, UploadEventPayload } from '../../src'
import { fixture, repositoryFixture } from '../fixtures'

export default () => {
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
        repositoryFixture.id as string,
        ['defaultmedia'],
      )

      uploader.on('chunkProgress', ({ referenceId }: UploadEventPayload) => {
        assert.strictEqual(referenceId, 'test-small')
      })

      uploader.on('chunkComplete', ({ referenceId }: UploadEventPayload) => {
        assert.strictEqual(referenceId, 'test-small')
      })

      uploader.on(
        'fileComplete',
        ({ referenceId, content }: UploadEventPayload) => {
          assert.strictEqual(referenceId, 'test-small')

          assert.isNotNull(content, 'No response object')
          assert.exists(content.data, 'Has no data')
          assert.exists(content.data.versions, 'Has no versions')

          assert.exists(content.data.versions.primary, 'Has no primary version')
          assert.exists(
            content.data.versions.primarywebp,
            'Has no primary webp version',
          )
          assert.exists(content.data.versions.preview, 'Has no preview version')

          // Set content id for later use on another test for actions execute
          fixture.imageContentId = content.id
        },
      )

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
        repositoryFixture.id as string,
        ['defaultmedia'],
      )

      uploader.on('chunkProgress', ({ referenceId }: UploadEventPayload) => {
        assert.strictEqual(referenceId, 'test')
      })

      uploader.on('chunkComplete', ({ referenceId }: UploadEventPayload) => {
        assert.strictEqual(referenceId, 'test')
      })

      uploader.on(
        'fileComplete',
        ({ referenceId, content }: UploadEventPayload) => {
          assert.strictEqual(referenceId, 'test')

          assert.isNotNull(content, 'No response object')
          assert.exists(content.data, 'Has no data')
          assert.exists(content.data.versions, 'Has no versions')

          assert.exists(content.data.versions.primary, 'Has no primary version')
          assert.exists(
            content.data.versions.primarywebp,
            'Has no primary webp version',
          )
          assert.exists(content.data.versions.preview, 'Has no preview version')
        },
      )

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
        repositoryFixture.id as string,
        ['defaultmedia'],
      )

      uploader.on('chunkProgress', ({ referenceId }: UploadEventPayload) => {
        assert.strictEqual(referenceId, 'test')
      })

      uploader.on('chunkComplete', ({ referenceId }: UploadEventPayload) => {
        assert.strictEqual(referenceId, 'test')
      })

      uploader.on(
        'fileComplete',
        ({ referenceId, content }: UploadEventPayload) => {
          assert.strictEqual(referenceId, 'test')

          assert.isNotNull(content, 'No response object')
          assert.exists(content.data, 'Has no data')
          assert.exists(content.data.versions, 'Has no versions')

          assert.exists(content.data.versions.primary, 'Has no primary version')
          assert.exists(
            content.data.versions.primarywebp,
            'Has no primary webp version',
          )
          assert.exists(content.data.versions.preview, 'Has no preview version')
        },
      )

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
