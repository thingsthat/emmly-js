import { assert } from 'chai'

import { EmmlyClient, EmmlyResponse } from '../../src'
import { IAction, IRepository } from '../../src/types/emmly'

export default (mockRepository: IRepository, mockAction: IAction) => {
  describe('Emmly actions', function () {
    it('should create action', function (done) {
      const client = new EmmlyClient()
      client
        .query(
          `mutation action($action: JSON!, $repositorySlug: String!) { 
                action(action: $action, repositorySlug: $repositorySlug) {
                    id 
                    name
                    type
                    options
                }
            }`,
          {
            action: mockAction,
            repositorySlug: mockRepository.id,
          },
        )
        .then(function (response: EmmlyResponse) {
          assert.isNotNull(response, 'No response object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          mockAction.id = response.data.action.id

          done()
        })
        .catch(done)
    })

    it('should update action', function (done) {
      mockAction.options.width = 670

      const client = new EmmlyClient()
      client
        .query(
          `mutation action($action: JSON!, $repositorySlug: String!) { 
                action(action: $action, repositorySlug: $repositorySlug) {
                    id 
                    name
                    type
                    options
                }
            }`,
          {
            action: mockAction,
            repositorySlug: mockRepository.id,
          },
        )
        .then(function (response: EmmlyResponse) {
          assert.isNotNull(response, 'No response object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          assert.strictEqual(response.data.action.options.width, 670)

          done()
        })
        .catch(done)
    })
  })
}
