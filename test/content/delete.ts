import { assert } from 'chai'

import { EmmlyClient, EmmlyResponse } from '../../src'
import {
  contentFixture,
  contentFixture2,
  fixture,
  repositoryFixture,
} from '../fixtures'

export default () => {
  describe('Emmly delete content', function () {
    it("should delete contents by id's via resource", function (done) {
      const client = new EmmlyClient()
      client
        .content(contentFixture.id)
        .repository(repositoryFixture.id || '')
        .delete()
        .then(function (response: EmmlyResponse) {
          assert.isNotNull(response, 'No response object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          assert.strictEqual(response.data.id, contentFixture.id)

          done()
        })
        .catch(done)
    })

    it("should delete contents by id's via resource", function (done) {
      const client = new EmmlyClient()
      client
        .content(fixture.imageContentId || '')
        .repository(repositoryFixture.id || '')
        .delete()
        .then(() => client.content(contentFixture2.id).delete())
        .then(function () {
          done()
        })
        .catch(function () {
          done()
        })
    })
  })
}
