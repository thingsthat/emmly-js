import { EmmlyClient } from '../../src'
import {
  mockContent,
  mockContent2,
  mockContent3,
  mockRepository,
} from '../mock'

export default () => {
  describe('Emmly delete content', function () {
    it("should delete contents by id's via resource", function (done) {
      const client = new EmmlyClient()
      client
        .content(mockContent.id as string)
        .repository(mockRepository.id as string)
        .delete()
        .then(() =>
          client
            .content(mockContent2.id)
            .repository(mockRepository.id as string)
            .delete(),
        )
        .then(() =>
          client
            .content(mockContent3.id)
            .repository(mockRepository.id as string)
            .delete(),
        )
        .then(function () {
          done()
        })
        .catch(function (error) {
          done(error)
        })
    })
  })
}
