import { assert } from 'chai'

import { EmmlyClient } from '../src'

export default () => {
  describe('Emmly', function () {
    it('should ping', function (done) {
      const client = new EmmlyClient()
      client
        .ping()
        .then(function (response) {
          assert.exists(response.data.name)
          assert.exists(response.data.version)

          done()
        })
        .catch(done)
    })
  })
}
