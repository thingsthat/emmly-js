import { assert } from 'chai'

import { EmmlyClient } from '../../src'
import { ContentStatus } from '../../src/resources/ContentResource'
import { IContent } from '../../src/types/emmly'
import { mockContent, mockContent2, mockRepository } from '../mock'

export default () => {
  describe('Emmly content default workflow', function () {
    it('should create default content', function (done) {
      const client = new EmmlyClient()
      client
        .query<{
          content: IContent
        }>(
          `mutation content($repositorySlug: String, $content: JSON!) { 
                content(repositorySlug: $repositorySlug, content: $content) {
                    id 
                    name 
                    data
                    revision {
                        id
                        status
                        contentId
                        delta
                    }
                }
            }`,
          {
            content: mockContent,
            repositorySlug: mockRepository.id,
          },
        )
        .then(function (response) {
          assert.isNotNull(response, 'No response object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          assert.exists(response.data.content, 'response.data.content')
          assert.exists(response.data.content.id, 'response.data.content.id')

          mockContent.id = response.data.content.id

          assert.exists(
            response.data.content.name,
            'response.data.content.name',
          )

          assert.strictEqual(response.data.content.name, mockContent.name)

          assert.exists(
            response.data.content.revision,
            'response.data.content.revision',
          )
          assert.exists(
            response.data.content.revision?.id,
            'response.data.content.revision.id',
          )
          assert.exists(
            response.data.content.revision?.status,
            'response.data.content.revision.status',
          )
          assert.exists(
            response.data.content.revision?.delta,
            'response.data.content.revision.delta',
          )
          assert.exists(
            response.data.content.revision?.delta?.data,
            'response.data.content.revision.delta.data',
          )

          assert.strictEqual(
            response.data.content.revision?.delta?.data.length,
            1,
          )
          assert.equal(
            response.data.content.revision?.delta?.data[0].test,
            'test',
          )

          assert.strictEqual(response.data.content.revision?.status, 'draft')

          done()
        })
        .catch(done)
    })

    it('should update default content', function (done) {
      const value = 'test update content'

      mockContent.data.test = value

      const client = new EmmlyClient()

      client
        .query<{
          content: IContent
        }>(
          `mutation content($content: JSON!) { 
                content(content: $content) {
                    id 
                    name
                    data
                    revision {
                        id
                        status
                        contentId
                        delta
                    }
                }
            }`,
          {
            content: mockContent,
          },
        )
        .then(function (response) {
          assert.isNotNull(response, 'No response object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          assert.exists(response.data.content, 'response.data.content')
          assert.exists(response.data.content.id, 'response.data.content.id')
          assert.exists(
            response.data.content.name,
            'response.data.content.name',
          )

          assert.strictEqual(response.data.content.name, mockContent.name)

          assert.exists(
            response.data.content.revision,
            'response.data.content.revision',
          )
          assert.exists(
            response.data.content.revision?.id,
            'response.data.content.revision.id',
          )
          assert.exists(
            response.data.content.revision?.status,
            'response.data.content.revision.status',
          )
          assert.exists(
            response.data.content.revision?.contentId,
            'response.data.content.revision.contentId',
          )
          assert.exists(
            response.data.content.revision?.delta,
            'response.data.content.revision.delta',
          )
          assert.exists(
            response.data.content.revision?.delta?.data,
            'response.data.content.revision.delta.data',
          )

          assert.strictEqual(
            Object.keys(response.data.content.revision?.delta?.data).length,
            1,
          )
          assert.equal(
            response.data.content.revision?.delta?.data.test[0],
            'test update content',
          )

          assert.strictEqual(
            response.data.content.revision?.contentId,
            response.data.content.id,
          )
          assert.strictEqual(response.data.content.revision?.status, 'draft')

          done()
        })
        .catch(done)
    })

    it('should make content public', function (done) {
      const client = new EmmlyClient()

      client
        .query<{
          contentStatus: IContent
        }>(
          `mutation contentStatus($contentId: ID!, $status: String!, $access: String) { 
                contentStatus(contentId: $contentId, status: $status, access: $access) {
                    id 
                    name
                    data
                    access
                    revision {
                        id
                        status
                        contentId
                        delta
                    }
                }
            }`,
          {
            access: 'public',
            contentId: mockContent.id,
            status: ContentStatus.PUBLISHED,
          },
        )
        .then(function (response) {
          assert.isNotNull(response, 'No response object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          assert.exists(
            response.data.contentStatus,
            'response.data.contentStatus',
          )
          assert.exists(
            response.data.contentStatus.id,
            'response.data.contentStatus.id',
          )

          assert.strictEqual(response.data.contentStatus.id, mockContent.id)

          assert.exists(
            response.data.contentStatus.revision,
            'response.data.contentStatus.revision',
          )
          assert.exists(
            response.data.contentStatus.revision?.id,
            'response.data.contentStatus.revision.id',
          )
          assert.exists(
            response.data.contentStatus.revision?.status,
            'response.data.contentStatus.revision.status',
          )
          assert.exists(
            response.data.contentStatus.revision?.contentId,
            'response.data.contentStatus.revision.contentId',
          )
          assert.exists(
            response.data.contentStatus.revision?.delta,
            'response.data.contentStatus.revision.delta',
          )
          assert.exists(
            response.data.contentStatus.revision?.delta?.data,
            'response.data.contentStatus.revision.delta.data',
          )

          assert.strictEqual(
            response.data.contentStatus.revision?.contentId,
            response.data.contentStatus.id,
          )
          assert.strictEqual(
            response.data.contentStatus.revision?.status,
            'published',
          )

          assert.strictEqual(response.data.contentStatus.access, 'public')

          done()
        })
        .catch(done)
    })

    it('should push new content and publish', function (done) {
      const client = new EmmlyClient()
      client
        .content(mockContent.id || '')
        .repository(mockRepository.id || '')
        .push(
          mockContent2,
          ['id', 'name', 'published'],
          ContentStatus.PUBLISHED,
        )
        .then(function (response) {
          assert.exists(response.data.id)
          assert.strictEqual(response.data.name, mockContent2.name)
          assert.strictEqual(response.data.published, true)

          mockContent2.id = response.data.id

          done()
        })
        .catch(function (error) {
          done(error)
        })
    })
  })
}
