import { assert } from 'chai'

import { EmmlyClient, EmmlyResponse } from '../../src'
import { IContent } from '../../src/types/content'
import { IRepository } from '../../src/types/repository'

export default (mockRepository: IRepository, mockContent: IContent) => {
  describe('Emmly revision queries', function () {
    it('should query all revisions for repository', function (done) {
      const client = new EmmlyClient()
      client
        .query(
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
        .then(function (response: EmmlyResponse) {
          assert.isNotNull(response, 'No response object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          assert.exists(response.data.revisions, 'No contents data')
          assert.strictEqual(
            response.data.revisions.length,
            6,
            'Revisions length not 6',
          )

          done()
        })
        .catch(done)
    })

    it('should query all revisions for content', function (done) {
      const client = new EmmlyClient()
      client
        .query(
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
        .then(function (response: EmmlyResponse) {
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
        .catch(done)
    })
  })
}
