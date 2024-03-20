import { assert } from 'chai'

import { EmmlyClient } from '../../src'
import { IContent, IRepository } from '../../src/types/emmly'

export default (mockRepository: IRepository, mockContent: IContent) => {
  describe('Emmly content queries', function () {
    it('should query all content for repository', function (done) {
      const client = new EmmlyClient()
      client
        .query<{
          contents: IContent[]
        }>(
          `query contents($repositorySlug: String!) {
                contents(repositorySlug: $repositorySlug) {
                    id
                    name
                }
            }`,
          {
            repositorySlug: mockRepository.id,
          },
        )
        .then(function (response) {
          assert.isNotNull(response, 'No response object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          assert.exists(response.data.contents, 'No contents data')
          assert.strictEqual(
            response.data.contents.length,
            4,
            'Content length not 4',
          )

          done()
        })
        .catch(done)
    })

    it('should query content by id', function (done) {
      const client = new EmmlyClient()
      client
        .query<{
          content: IContent
        }>(
          `query content($slug: String!, $repositorySlug: String) {
                content(slug: $slug, repositorySlug: $repositorySlug) {
                    id
                    name
                }
            }`,
          {
            repositorySlug: mockRepository.id,
            slug: mockContent.id,
          },
        )
        .then(function (response) {
          assert.isNotNull(response, 'No response object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          assert.exists(response.data.content, 'No content data')
          assert.exists(response.data.content.id, 'response.data.content.id')
          assert.exists(
            response.data.content.name,
            'response.data.content.name',
          )

          done()
        })
        .catch(done)
    })

    it('should query content by media type', function (done) {
      const client = new EmmlyClient()
      client
        .query<{
          contents: IContent[]
        }>(
          `query contents($repositorySlug: String!, $type: [String]) {
                contents(repositorySlug: $repositorySlug, type: $type) {
                    id
                    name
                }
            }`,
          {
            type: 'media',
            repositorySlug: mockRepository.id,
          },
        )
        .then(function (response) {
          assert.isNotNull(response, 'No response object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          assert.exists(response.data.contents, 'No contents data')
          assert.strictEqual(
            response.data.contents.length,
            3,
            'Content length not 3',
          )

          done()
        })
        .catch(done)
    })

    it('should query content by media type via resource', function (done) {
      const client = new EmmlyClient()

      client
        .content()
        .repository(mockRepository.id || '')
        .type('media')
        .fetch('id name')
        .then(function (response) {
          assert.isNotNull(response, 'No response object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          assert.strictEqual(response.data.length, 3, 'Content length not 3')

          assert.exists(response.data[0].id, 'response.data.content.id')
          assert.exists(response.data[0].name, 'response.data.content.name')

          done()
        })
        .catch(done)
    })

    it('should query content by id', function (done) {
      const client = new EmmlyClient()
      client
        .content(mockContent.id)
        .repository(mockRepository.id || '')
        .fetch('id name')
        .then(function (response) {
          assert.isNotNull(response, 'No response object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          assert.strictEqual(response.data.length, 1, 'Content length not 1')

          assert.exists(response.data[0].id, 'response.data.id')
          assert.exists(response.data[0].name, 'response.data.name')

          done()
        })
        .catch(done)
    })

    it('should query content by tag via resource', function (done) {
      const client = new EmmlyClient()
      client
        .content()
        .repository(mockRepository.id || '')
        .tags('test1')
        .fetch('id name')
        .then(function (response) {
          assert.isNotNull(response, 'No response object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          assert.strictEqual(response.data.length, 1, 'Content length not 1')

          assert.exists(response.data[0].id, 'response.data.content.id')
          assert.exists(response.data[0].name, 'response.data.content.name')

          done()
        })
        .catch(done)
    })

    it('should query content by tag array via resource', function (done) {
      const client = new EmmlyClient()
      client
        .content()
        .repository(mockRepository.id || '')
        .tags(['TEST1', 'Test2'])
        .fetch('id name')
        .then(function (response) {
          assert.isNotNull(response, 'No response object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          assert.strictEqual(response.data.length, 1, 'Content length not 1')

          assert.exists(response.data[0].id, 'response.data.content.id')
          assert.exists(response.data[0].name, 'response.data.content.name')

          done()
        })
        .catch(done)
    })
  })
}
