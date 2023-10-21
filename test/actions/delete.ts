import { assert } from 'chai'

import { EmmlyClient, EmmlyResponse } from '../../src'
import { actionFixture } from '../fixtures'

export default () => {
  describe('Emmly delete action', function () {
    it('should delete action by id', function (done) {
      const client = new EmmlyClient()
      client
        .query(
          `mutation deleteAction($actionId: ID!) {
                deleteAction(actionId: $actionId) {
                    id
                    name
                }
            }`,
          {
            actionId: actionFixture.id,
          },
        )
        .then(function (response: EmmlyResponse) {
          assert.isNotNull(response, 'No response object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          assert.strictEqual(response.data.deleteAction.id, actionFixture.id)

          done()
        })
        .catch(done)
    })
  })
}
