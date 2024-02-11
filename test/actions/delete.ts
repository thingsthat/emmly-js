import { assert } from 'chai'

import { EmmlyClient, EmmlyResponse } from '../../src'
import { IAction } from '../../src/types/emmly'

export default (mockAction: IAction) => {
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
            actionId: mockAction.id,
          },
        )
        .then(function (response: EmmlyResponse) {
          assert.isNotNull(response, 'No response object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          assert.strictEqual(response.data.deleteAction.id, mockAction.id)

          done()
        })
        .catch(done)
    })
  })
}
