import { assert } from 'chai'

import { EmmlyClient, EmmlyResponse } from '../../src'
import { IRepository } from '../../src/types/repository'

export default (mockRepository: IRepository) => {
  describe('Emmly models', function () {
    it('should query models via resource', function (done) {
      const client = new EmmlyClient()
      client
        .model()
        .repository(mockRepository.id || '')
        .fetch('id')
        .then(function (response: EmmlyResponse) {
          assert.isNotNull(response, 'No responsse object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          assert.exists(response.data, 'No models data')
          assert.strictEqual(response.data.length, 7, 'Model length not 7')

          done()
        })
        .catch(done)
    })
  })
}
