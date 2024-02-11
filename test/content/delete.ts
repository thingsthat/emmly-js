import { assert } from 'chai'

import { EmmlyClient, EmmlyResponse } from '../../src'
import { IContent, IRepository } from '../../src/types/emmly'

export default (
  mockRepository: IRepository,
  mockContent: IContent,
  mockContent2: IContent,
  mockContent3: IContent,
  mockContent4: IContent,
) => {
  describe('Emmly delete content', function () {
    it("should delete contents by id's via resource", function (done) {
      const client = new EmmlyClient()
      client
        .content(mockContent.id)
        .repository(mockRepository.id || '')
        .delete()
        .then(function (response: EmmlyResponse) {
          assert.isNotNull(response, 'No response object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          assert.strictEqual(response.data.id, mockContent.id)

          done()
        })
        .catch(done)
    })

    it("should delete contents by id's via resource", function (done) {
      const client = new EmmlyClient()
      client
        .content(mockContent3.id || '')
        .repository(mockRepository.id || '')
        .delete()
        .then(() => client.content(mockContent2.id).delete())
        .then(() => client.content(mockContent4.id).delete())
        .then(function () {
          done()
        })
        .catch(function () {
          done()
        })
    })
  })
}
