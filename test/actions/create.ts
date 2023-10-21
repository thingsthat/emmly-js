import { assert } from 'chai'

import { EmmlyClient, EmmlyResponse } from '../../src'
import { actionFixture, repositoryFixture } from '../fixtures'

export default () => {
  describe('Emmly actions', function () {
    it('should create action', function (done) {
      const client = new EmmlyClient()
      client
        .query(
          `mutation action($action: JSON!, $repositorySlug: String!) { 
                action(action: $action, repositorySlug: $repositorySlug) {
                    id 
                    name
                    type
                    options
                }
            }`,
          {
            action: actionFixture,
            repositorySlug: repositoryFixture.id,
          },
        )
        .then(function (response: EmmlyResponse) {
          assert.isNotNull(response, 'No response object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          actionFixture.id = response.data.action.id

          done()
        })
        .catch(done)
    })

    it('should update action', function (done) {
      actionFixture.options.width = 670

      const client = new EmmlyClient()
      client
        .query(
          `mutation action($action: JSON!, $repositorySlug: String!) { 
                action(action: $action, repositorySlug: $repositorySlug) {
                    id 
                    name
                    type
                    options
                }
            }`,
          {
            action: actionFixture,
            repositorySlug: repositoryFixture.id,
          },
        )
        .then(function (response: EmmlyResponse) {
          assert.isNotNull(response, 'No response object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          assert.strictEqual(response.data.action.options.width, 670)

          done()
        })
        .catch(done)
    })
  })
}
