import { assert } from 'chai'

import { EmmlyClient, EmmlyResponse } from '../../src'
import { workflowFixture } from '../fixtures'

export default () => {
  describe('Emmly delete workflow', function () {
    it('should delete workflow by id', function (done) {
      const client = new EmmlyClient()
      client
        .query(
          `mutation deleteWorkflow($workflowId: ID!) {
                deleteWorkflow(workflowId: $workflowId) {
                    id
                    name
                }
            }`,
          {
            workflowId: workflowFixture.id,
          },
        )
        .then(function (response: EmmlyResponse) {
          assert.isNotNull(response, 'No response object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          assert.strictEqual(
            response.data.deleteWorkflow.id,
            workflowFixture.id,
          )

          done()
        })
        .catch(done)
    })
  })
}
