import { assert } from 'chai'

import { EmmlyClient } from '../../src'
import { IRepository } from '../../src/types/emmly'
import { mockRepository } from '../mock'

export default () => {
  describe('Emmly repositories', function () {
    it('should query no repositories via resource', function (done) {
      const client = new EmmlyClient()
      client
        .repository()
        .fetch('id name models { id name }')
        .then(function (response) {
          assert.isNotNull(response, 'No response object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          done()
        })
        .catch(function (error) {
          done(error)
        })
    })

    it('should create an empty repository', function (done) {
      const client = new EmmlyClient()
      client
        .query<{
          repository: IRepository
        }>(
          `mutation repository($repository: JSON!) { 
                repository(repository: $repository) {
                    id
                    name
                    role
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
          assert.exists(
            response.data.repository.role,
            'response.data.repository.role',
          )

          assert.equal(response.data.repository.role, 'OWNER')

          assert.equal(response.data.repository.name, mockRepository.name)

          mockRepository.id = response.data.repository.id

          done()
        })
        .catch(function (error) {
          done(error)
        })
    })
  })
}
