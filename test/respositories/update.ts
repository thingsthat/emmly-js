import { assert } from 'chai'

import { EmmlyClient, EmmlyResponse } from '../../src'
import { repositoryFixture } from '../fixtures'

export default () => {
  describe('Emmly repositories update', function () {
    it('should update the repository language', function (done) {
      const client = new EmmlyClient()
      repositoryFixture.primaryLanguage = 'fr'

      client
        .query(
          `mutation repository($repository: JSON!) { 
                repository(repository: $repository) {
                    id
                    name
                    primaryLanguage
                }
            }`,
          {
            repository: repositoryFixture,
          },
        )
        .then(function (response: EmmlyResponse) {
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
