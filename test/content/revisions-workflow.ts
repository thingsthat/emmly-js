import { assert } from 'chai'

import { EmmlyClient, EmmlyResponse, EmmlyResponseError } from '../../src'
import { fixture } from '../fixtures'

export default () => {
  describe('Emmly revisions workflow', function () {
    it('should update revision to next step in workflow', function (done) {
      const client = new EmmlyClient()
      client
        .query(
          `mutation revisionStatus($revisionId: ID!, $status: String!) { 
                revisionStatus(revisionId: $revisionId, status: $status) {
                    revision {
                        id
                        status
                    }
                    content {
                        id
                        data
                    }
                }
            }`,
          {
            revisionId: fixture.revisionId,
            status: 'published',
          },
        )
        .then(function (response: EmmlyResponse) {
          assert.isNotNull(response, 'No response object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          assert.exists(
            response.data.revisionStatus,
            'response.data.revisionStatus',
          )
          assert.exists(
            response.data.revisionStatus.revision,
            'response.data.revisionStatus.revision',
          )
          assert.exists(
            response.data.revisionStatus.revision.id,
            'response.data.revisionStatus.revision.id',
          )
          assert.exists(
            response.data.revisionStatus.revision.status,
            'response.data.revisionStatus.revision.status',
          )

          assert.strictEqual(
            response.data.revisionStatus.revision.status,
            'published',
          )

          assert.exists(
            response.data.revisionStatus.content,
            'response.data.revisionStatus.content',
          )
          assert.exists(
            response.data.revisionStatus.content.id,
            'response.data.revisionStatus.content.id',
          )
          assert.exists(
            response.data.revisionStatus.content.data,
            'response.data.revisionStatus.content.data',
          )
          assert.exists(
            response.data.revisionStatus.content.data.test,
            'response.data.revisionStatus.content.data.test',
          )

          assert.strictEqual(
            response.data.revisionStatus.content.data.test,
            'test update content',
          )

          done()
        })
        .catch(done)
    })

    it('should fail update revision to next step in workflow with incorrect status', function (done) {
      const client = new EmmlyClient()
      client
        .query(
          `mutation revisionStatus($revisionId: ID!, $status: String!) { 
                revisionStatus(revisionId: $revisionId, status: $status) {
                    revision {
                        id
                        status
                    }
                    content {
                        id
                        data
                    }
                }
            }`,
          {
            revisionId: fixture.revisionId,
            status: 'blah',
          },
        )
        .then(function () {
          assert.fail('Expected 400 query exception not thrown')
        })
        .catch(function (e: EmmlyResponseError) {
          assert.isNotNull(e, 'No error object')
          assert.exists(e.errors, 'error has no errors')

          assert.exists(e.errors[0], 'e.errors[0]')
          assert.exists(e.errors[0].status, 'e.errors[0].status')

          assert.strictEqual(e.errors[0].status, 400)

          done()
        })
    })
  })
}
