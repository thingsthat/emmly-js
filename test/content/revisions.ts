import { assert } from 'chai'
import * as jsondiffpatch from 'jsondiffpatch'

import { EmmlyClient, EmmlyResponse } from '../../src'
import { IContent } from '../../src/types/emmly'

export default (mockContent: IContent) => {
  describe('Emmly revisions', function () {
    it('should create content revision', function (done) {
      // TODO: Move this into the SDK

      // Create delta
      const delta = jsondiffpatch.diff(
        mockContent,
        Object.assign({}, mockContent, {
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
            contentId: mockContent.id,
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
