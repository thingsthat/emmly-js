import { assert } from 'chai'

import { EmmlyClient } from '../../src'
import { IRepository } from '../../src/types/emmly'

export default (mockRepository: IRepository) => {
  describe('Emmly models', function () {
    it('should query models via resource', function (done) {
      const client = new EmmlyClient()
      client
        .model()
        .repository(mockRepository.id || '')
        .fetch('id')
        .then(function (response) {
          assert.isNotNull(response, 'No responsse object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          assert.exists(response.data, 'No models data')
          assert.strictEqual(response.data.length, 10, 'Model length not 10')

          done()
        })
        .catch(done)
    })
  })
}
