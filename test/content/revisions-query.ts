import { assert } from 'chai'

import { EmmlyClient, EmmlyResponse } from '../../src'
import { contentFixture, repositoryFixture } from '../fixtures'

export default () => {
  describe('Emmly revision queries', function () {
    it('should query all revisions for repository', function (done) {
      const client = new EmmlyClient()
      client
        .query(
          `query revisions($repositoryId: ID!) {
                revisions(repositoryId: $repositoryId) {
                    id
                    contentId
                }
            }`,
          {
            repositoryId: repositoryFixture.id,
          },
        )
        .then(function (response: EmmlyResponse) {
          assert.isNotNull(response, 'No response object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          assert.exists(response.data.revisions, 'No contents data')
          assert.strictEqual(
            response.data.revisions.length,
            5,
            'Revisions length not 5',
          )

          done()
        })
        .catch(done)
    })

    it('should query all revisions for content', function (done) {
      const client = new EmmlyClient()
      client
        .query(
          `query revisions($repositoryId: ID!, $contentId: ID) {
                revisions(repositoryId: $repositoryId, contentId: $contentId) {
                    id
                    contentId
                }
            }`,
          {
            repositoryId: repositoryFixture.id,
            contentId: contentFixture.id,
          },
        )
        .then(function (response: EmmlyResponse) {
          assert.isNotNull(response, 'No response object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          assert.exists(response.data.revisions, 'No contents data')
          assert.strictEqual(
            response.data.revisions.length,
            3,
            'Revisions length not 3',
          )

          done()
        })
        .catch(done)
    })
  })
}
