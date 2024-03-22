import { assert } from 'chai'

import { EmmlyClient } from '../../src'
import { IRevision } from '../../src/types/emmly'
import { mockContent, mockRepository } from '../mock'

export default () => {
  describe('Emmly revision queries', function () {
    it('should query all revisions for repository', function (done) {
      const client = new EmmlyClient()
      client
        .query<{
          revisions: IRevision[]
        }>(
          `query revisions($repositorySlug: String!) {
                revisions(repositorySlug: $repositorySlug) {
                    id
                    contentId
                }
            }`,
          {
            repositorySlug: mockRepository.id,
          },
        )
        .then(function (response) {
          assert.isNotNull(response, 'No response object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          assert.exists(response.data.revisions, 'No contents data')
          assert.strictEqual(
            response.data.revisions.length,
            3,
            'Revisions length not 3',
          )

          done()
        })
        .catch(function (error) {
          done(error)
        })
    })

    it('should query all revisions for content', function (done) {
      const client = new EmmlyClient()
      client
        .query<{
          revisions: IRevision[]
        }>(
          `query revisions($repositorySlug: String!, $contentId: ID) {
                revisions(repositorySlug: $repositorySlug, contentId: $contentId) {
                    id
                    contentId
                }
            }`,
          {
            contentId: mockContent.id,
            repositorySlug: mockRepository.id,
          },
        )
        .then(function (response) {
          assert.isNotNull(response, 'No response object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          assert.exists(response.data.revisions, 'No contents data')
          assert.strictEqual(
            response.data.revisions.length,
            2,
            'Revisions length not 2',
          )

          done()
        })
        .catch(function (error) {
          done(error)
        })
    })
  })
}
