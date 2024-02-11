import { assert } from 'chai'

import { EmmlyClient, EmmlyResponse } from '../../src'
import { IModel, IRepository } from '../../src/types/emmly'

export default (mockRepository: IRepository, mockModel: IModel) => {
  describe('Emmly delete model', function () {
    it('should delete model by id via resource', function (done) {
      const client = new EmmlyClient()
      client
        .model(mockModel.id)
        .repository(mockRepository.id || '')
        .delete()
        .then(function (response: EmmlyResponse) {
          assert.isNotNull(response, 'No response object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          assert.strictEqual(response.data.id, mockModel.id)

          done()
        })
        .catch(done)
    })
  })
}
