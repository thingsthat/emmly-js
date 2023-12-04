import { assert } from 'chai'

import { EmmlyClient, EmmlyResponse, EmmlyResponseError } from '../../src'
import { repositoryFixture } from '../fixtures'

export default () => {
  describe('Emmly repositories options', function () {
    it('should update the repository display name', function (done) {
      const client = new EmmlyClient()
      const displayName = `${repositoryFixture.name}-display`
      repositoryFixture.options = {}
      repositoryFixture.options.displayName = displayName

      client
        .query(
          `mutation repository($repository: JSON!) { 
                repository(repository: $repository) {
                    id
                    name
                    options
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
          assert.equal(response.data.repository.name, repositoryFixture.name)
          assert.equal(
            response.data.repository.options.displayName,
            displayName,
          )

          repositoryFixture.options = response.data.repository.options

          done()
        })
        .catch(done)
    })

    it('should update the repository option for the addon', function (done) {
      const client = new EmmlyClient()
      client
        .query(
          `mutation repositoryOption($repositorySlug: String!, $name: String!, $value: JSON!) { 
                repositoryOption(repositorySlug: $repositorySlug, name: $name, value: $value) {
                    options
                }
            }`,
          {
            name: 'repository',
            repositorySlug: repositoryFixture.id,
            value: {
              enabled: true,
            },
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

    it('should fail the repository option nooption as that does not exist', function (done) {
      const client = new EmmlyClient()
      repositoryFixture.options.nooption = 11

      client
        .query(
          `mutation repository($repository: JSON!) { 
                repository(repository: $repository) {
                    id
                    name
                    options
                }
            }`,
          {
            repository: repositoryFixture,
          },
        )
        .then(function () {
          assert.fail('Expected 400 query exception not thrown')
        })
        .catch(function (e: EmmlyResponseError) {
          assert.isNotNull(e, 'No error object')
          assert.exists(e.errors, 'error has no errors')

          assert.exists(e.errors[0], 'e.errors[0]')
          assert.exists(e.errors[0].status, 'e.errors[0].status')

          assert.strictEqual(e.errors[0].status, 400)

          done()
        })
    })
  })
}
