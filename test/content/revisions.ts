import { assert } from 'chai'
import * as jsondiffpatch from 'jsondiffpatch'

import { EmmlyClient, EmmlyResponse } from '../../src'
import { contentFixture } from '../fixtures'

export default () => {
  describe('Emmly revisions', function () {
    it('should create content revision', function (done) {
      // Create delta
      const delta = jsondiffpatch.diff(
        contentFixture,
        Object.assign({}, contentFixture, {
          data: { test: 'test revision content' },
        }),
      )

      // Send revision to client
      const client = new EmmlyClient()
      client
        .query(
          `mutation revision($contentId: ID!, $delta: JSON!) { 
                revision(contentId: $contentId, delta: $delta) {
                    id
                    contentId
                    status
                }
            }`,
          {
            contentId: contentFixture.id,
            delta,
          },
        )
        .then(function (response: EmmlyResponse) {
          assert.isNotNull(response, 'No response object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          assert.exists(response.data.revision, 'response.data.revision')
          assert.exists(response.data.revision.id, 'response.data.revision.id')
          assert.exists(
            response.data.revision.contentId,
            'response.data.revision.contentId',
          )
          assert.exists(
            response.data.revision.status,
            'response.data.revision.status',
          )

          assert.strictEqual(response.data.revision.status, 'draft')

          done()
        })
        .catch(done)
    })
  })
}
