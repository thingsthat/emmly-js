import { assert } from 'chai'

import { EmmlyClient, EmmlyResponse } from '../../src'
import { IContent, IRepository } from '../../src/types/emmly'

export default (
  mockRepository: IRepository,
  mockContent: IContent,
  mockContent4: IContent,
  mockRevision,
) => {
  describe('Emmly content', function () {
    it('should create content', function (done) {
      const client = new EmmlyClient()

      client
        .query(
          `mutation content($repositorySlug: String, $content: JSON!) { 
                content(repositorySlug: $repositorySlug, content: $content) {
                    id 
                    name 
                    data
                    revision {
                        id
                        status
                        contentId
                    }
                }
            }`,
          {
            content: mockContent,
            repositorySlug: mockRepository.name,
          },
        )
        .then(function (response: EmmlyResponse) {
          assert.isNotNull(response, 'No response object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          assert.exists(response.data.content, 'response.data.content')
          assert.exists(response.data.content.id, 'response.data.content.id')
          assert.exists(
            response.data.content.name,
            'response.data.content.name',
          )

          assert.strictEqual(response.data.content.name, mockContent.name)

          assert.exists(
            response.data.content.revision,
            'response.data.content.revision',
          )
          assert.exists(
            response.data.content.revision.id,
            'response.data.content.revision.id',
          )
          assert.exists(
            response.data.content.revision.status,
            'response.data.content.revision.status',
          )

          assert.strictEqual(response.data.content.revision.status, 'draft')

          mockContent.id = response.data.content.id

          done()
        })
        .catch(done)
    })

    it('should create content with resource', function (done) {
      const client = new EmmlyClient()

      client
        .content()
        .repository(mockRepository.name)
        .push(mockContent4)
        .then(function (response: EmmlyResponse) {
          assert.isNotNull(response, 'No response object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          assert.exists(response.data, 'response.data')
          assert.exists(response.data.id, 'response.data.id')
          assert.exists(response.data.name, 'response.data.name')

          assert.strictEqual(response.data.name, mockContent4.name)

          mockContent4.id = response.data.id

          done()
        })
        .catch(done)
    })

    it('should update content', function (done) {
      const value = 'test update content'

      // TODO: Ideally want to pass model interface here so we have field types in the data structure. JSON works for now.
      // @ts-ignore
      mockContent.data.test = value

      const client = new EmmlyClient()

      client
        .query(
          `mutation content($repositorySlug: String, $content: JSON!) { 
                content(repositorySlug: $repositorySlug, content: $content) {
                    id 
                    name
                    data
                    revision {
                        id
                        status
                        contentId
                        delta
                    }
                }
            }`,
          {
            content: mockContent,
            repositorySlug: mockRepository.id,
          },
        )
        .then(function (response: EmmlyResponse) {
          assert.isNotNull(response, 'No response object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          assert.exists(response.data.content, 'response.data.content')
          assert.exists(response.data.content.id, 'response.data.content.id')
          assert.exists(
            response.data.content.name,
            'response.data.content.name',
          )

          assert.strictEqual(response.data.content.name, mockContent.name)

          assert.exists(
            response.data.content.revision,
            'response.data.content.revision',
          )
          assert.exists(
            response.data.content.revision.id,
            'response.data.content.revision.id',
          )
          assert.exists(
            response.data.content.revision.status,
            'response.data.content.revision.status',
          )
          assert.exists(
            response.data.content.revision.contentId,
            'response.data.content.revision.contentId',
          )
          assert.exists(
            response.data.content.revision.delta,
            'response.data.content.revision.delta',
          )
          assert.exists(
            response.data.content.revision.delta.data,
            'response.data.content.revision.delta.data',
          )

          assert.strictEqual(
            response.data.content.revision.delta.data.test.length,
            1,
          )
          assert.equal(
            response.data.content.revision.delta.data.test[0],
            'test update content',
          )

          assert.strictEqual(
            response.data.content.revision.contentId,
            response.data.content.id,
          )
          assert.strictEqual(response.data.content.revision.status, 'draft')

          mockRevision.id = response.data.content.revision.id

          done()
        })
        .catch(done)
    })
  })
}
