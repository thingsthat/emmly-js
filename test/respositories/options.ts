import { assert } from 'chai'

import { EmmlyClient } from '../../src'
import { IRepository } from '../../src/types/emmly'

export default (mockRepository: IRepository) => {
  describe('Emmly repositories options', function () {
    it('should update the repository display name', function (done) {
      const client = new EmmlyClient()
      const displayName = `${mockRepository.name}-display`
      mockRepository.options = {}
      mockRepository.options.displayName = displayName

      client
        .query<{
          repository: IRepository
        }>(
          `mutation repository($repository: JSON!) { 
                repository(repository: $repository) {
                    id
                    name
                    options
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
          assert.equal(response.data.repository.name, mockRepository.name)
          assert.equal(
            response.data.repository.options.displayName,
            displayName,
          )

          mockRepository.options = response.data.repository.options

          done()
        })
        .catch(done)
    })

    it('should update the repository option for the addon', function (done) {
      const client = new EmmlyClient()
      client
        .query<{
          repositoryOption: IRepository
        }>(
          `mutation repositoryOption($repositorySlug: String!, $name: String!, $value: JSON!) { 
                repositoryOption(repositorySlug: $repositorySlug, name: $name, value: $value) {
                    options
                }
            }`,
          {
            name: 'repository',
            repositorySlug: mockRepository.id,
            value: {
              enabled: true,
            },
          },
        )
        .then(function (response) {
          assert.isNotNull(response, 'No response object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          done()
        })
        .catch(done)
    })

    it('should fail the repository option nooption as that does not exist', function (done) {
      const client = new EmmlyClient()
      mockRepository.options.nooption = 11

      client
        .query<{
          repository: IRepository
        }>(
          `mutation repository($repository: JSON!) { 
                repository(repository: $repository) {
                    id
                    name
                    options
                }
            }`,
          {
            repository: mockRepository,
          },
        )
        .then(function () {
          assert.fail('Expected 400 query exception not thrown')
        })
        .catch(function (error) {
          assert.isNotNull(error, 'No error object')
          assert.exists(error.errors, 'error has no errors')

          assert.exists(error.errors[0], 'e.errors[0]')
          assert.exists(error.errors[0].status, 'e.errors[0].status')

          assert.strictEqual(error.errors[0].status, 400)

          done()
        })
    })
  })
}
