import { assert } from 'chai'

import { EmmlyClient, EmmlyResponse } from '../../src'
import { repositoryFixture, contentFixture } from '../fixtures'

export default () => {
  describe('Emmly content queries', function () {
    it('should query all content for repository', function (done) {
      const client = new EmmlyClient()
      client
        .query(
          `query contents($repositoryId: ID!) {
                contents(repositoryId: $repositoryId) {
                    id
                    name
                }
            }`,
          {
            repositoryId: repositoryFixture.id,
          },
        )
        .then(function (response: EmmlyResponse) {
          assert.isNotNull(response, 'No response object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          assert.exists(response.data.contents, 'No contents data')
          assert.strictEqual(
            response.data.contents.length,
            5,
            'Content length not 5',
          )

          done()
        })
        .catch(done)
    })

    it('should query content by id', function (done) {
      const client = new EmmlyClient()
      client
        .query(
          `query content($slug: String!, $repositoryId: ID) {
                content(slug: $slug, repositoryId: $repositoryId) {
                    id
                    name
                }
            }`,
          {
            slug: contentFixture.id,
            repositoryId: repositoryFixture.id,
          },
        )
        .then(function (response: EmmlyResponse) {
          assert.isNotNull(response, 'No response object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          assert.exists(response.data.content, 'No content data')
          assert.exists(response.data.content.id, 'response.data.content.id')
          assert.exists(
            response.data.content.name,
            'response.data.content.name',
          )

          done()
        })
        .catch((error) => {
          console.log(error)
          done()
        })
    })

    it('should query content by media type', function (done) {
      const client = new EmmlyClient()
      client
        .query(
          `query contents($repositoryId: ID!, $type: [String]) {
                contents(repositoryId: $repositoryId, type: $type) {
                    id
                    name
                }
            }`,
          {
            repositoryId: repositoryFixture.id,
            type: 'media',
          },
        )
        .then(function (response: EmmlyResponse) {
          assert.isNotNull(response, 'No response object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          assert.exists(response.data.contents, 'No contents data')
          assert.strictEqual(
            response.data.contents.length,
            3,
            'Content length not 3',
          )

          done()
        })
        .catch(done)
    })

    it('should query content by media type via resource', function (done) {
      const client = new EmmlyClient()

      client
        .content()
        .repository(repositoryFixture.id || '')
        .type('media')
        .fetch('id name')
        .then(function (response: EmmlyResponse) {
          assert.isNotNull(response, 'No response object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          assert.strictEqual(response.data.length, 3, 'Content length not 3')

          assert.exists(response.data[0].id, 'response.data.content.id')
          assert.exists(response.data[0].name, 'response.data.content.name')

          done()
        })
        .catch(done)
    })

    it('should query content by id', function (done) {
      const client = new EmmlyClient()
      client
        .content(contentFixture.id)
        .repository(repositoryFixture.id || '')
        .fetch('id name')
        .then(function (response: EmmlyResponse) {
          assert.isNotNull(response, 'No response object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          assert.exists(response.data.id, 'response.data.content.id')
          assert.exists(response.data.name, 'response.data.content.name')

          done()
        })
        .catch(done)
    })

    // TODO: Add multi repository access test
    /*it('should fail to query content by id with no access', function(done) {

      const client = new EmmlyClient()
      client.content('65614607-4668-4586-a46c-3473c753c0a1').fetch('id name')
          .then(function(response: any) {

            assert.fail('Expected 403 query exception not thrown')


          })
          .catch(function(e: any) {

            assert.isNotNull(e, 'No error object')
            assert.exists(e.errors, 'Has no errors')

            assert.strictEqual(e.status, 401, 'Exception status not 401')
            assert.equal(e.message, 'Bad authentication. Auth key required.')

            done()

          })

    })*/

    it('should query content by tag via resource', function (done) {
      const client = new EmmlyClient()
      client
        .content()
        .repository(repositoryFixture.id || '')
        .tags('test1')
        .fetch('id name')
        .then(function (response: EmmlyResponse) {
          assert.isNotNull(response, 'No response object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          assert.strictEqual(response.data.length, 1, 'Content length not 1')

          assert.exists(response.data[0].id, 'response.data.content.id')
          assert.exists(response.data[0].name, 'response.data.content.name')

          done()
        })
        .catch(done)
    })

    it('should query content by tag array via resource', function (done) {
      const client = new EmmlyClient()
      client
        .content()
        .repository(repositoryFixture.id || '')
        .tags(['TEST1', 'Test2'])
        .fetch('id name')
        .then(function (response: EmmlyResponse) {
          assert.isNotNull(response, 'No response object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          assert.strictEqual(response.data.length, 1, 'Content length not 1')

          assert.exists(response.data[0].id, 'response.data.content.id')
          assert.exists(response.data[0].name, 'response.data.content.name')

          done()
        })
        .catch(done)
    })
  })
}
