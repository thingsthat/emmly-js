import { assert } from 'chai'

import { EmmlyClient } from '../../src'
import { IRepository } from '../../src/types/emmly'

export default (mockRepository: IRepository) => {
  describe('Emmly repositories update', function () {
    it('should update the repository language', function (done) {
      const client = new EmmlyClient()
      mockRepository.primaryLanguage = 'fr'

      client
        .query<{
          repository: IRepository
        }>(
          `mutation repository($repository: JSON!) { 
                repository(repository: $repository) {
                    id
                    name
                    primaryLanguage
                }
            }`,
          {
            repository: mockRepository,
          },
        )
        .then(function (response) {
          assert.isNotNull(response, 'No response object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          assert.exists(
            response.data.repository.id,
            'response.data.repository.id',
          )
          assert.exists(
            response.data.repository.name,
            'response.data.repository.name',
          )
          assert.equal(response.data.repository.primaryLanguage, 'fr')

          done()
        })
        .catch(done)
    })
  })
}
