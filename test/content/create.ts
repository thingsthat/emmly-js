import { assert } from 'chai'

import { EmmlyClient, EmmlyResponse } from '../../src'
import { fixture, contentFixture, repositoryFixture } from '../fixtures'

export default () => {
  describe('Emmly content', function () {
    it('should create content', function (done) {
      const client = new EmmlyClient()
      contentFixture.repository = repositoryFixture.id

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
            repositorySlug: repositoryFixture.name,
            content: contentFixture,
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

          assert.strictEqual(response.data.content.name, contentFixture.name)

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

          contentFixture.id = response.data.content.id

          done()
        })
        .catch(done)
    })

    it('should update content', function (done) {
      const value = 'test update content'
      contentFixture.data.test = value

      const client = new EmmlyClient()
      contentFixture.repository = repositoryFixture.id

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
            repositorySlug: repositoryFixture.id,
            content: contentFixture,
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

          assert.strictEqual(response.data.content.name, contentFixture.name)

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

          fixture.revisionId = response.data.content.revision.id

          done()
        })
        .catch(done)
    })
  })
}
