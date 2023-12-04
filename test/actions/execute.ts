import { assert } from 'chai'

import { EmmlyClient, EmmlyResponse } from '../../src'
import { actionFixture, fixture, repositoryFixture } from '../fixtures'

export default () => {
  describe('Emmly actions execute', function () {
    it('should execute image resize action', function (done) {
      const client = new EmmlyClient()
      client.setTimeout(20000) // Increase timeout for local lambda testing
      client
        .query(
          `query execute($action: String, $repositorySlug: String!, $contentId: ID) { 
                execute(action: $action, repositorySlug: $repositorySlug, contentId: $contentId) {
                    result
                }
            }`,
          {
            action: actionFixture.id,
            contentId: fixture.imageContentId,
            repositorySlug: repositoryFixture.id,
          },
        )
        .then(function (response: EmmlyResponse) {
          assert.isNotNull(response, 'No response object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          done()
        })
        .catch(done)
    })
  })
}
