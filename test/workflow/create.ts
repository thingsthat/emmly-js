import { assert } from 'chai'

import { EmmlyClient, EmmlyResponse } from '../../src'
import { repositoryFixture, workflowFixture } from '../fixtures'

export default () => {
  describe('Emmly workflows', function () {
    it('should create workflow', function (done) {
      const client = new EmmlyClient()
      client
        .query(
          `mutation workflow($workflow: JSON!, $repositorySlug: String!) { 
                workflow(workflow: $workflow, repositorySlug: $repositorySlug) {
                    id 
                    name
                    default
                }
            }`,
          {
            workflow: workflowFixture,
            repositorySlug: repositoryFixture.id,
          },
        )
        .then(function (response: EmmlyResponse) {
          assert.isNotNull(response, 'No response object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          assert.exists(response.data.workflow, 'response.data.workflow')
          assert.exists(response.data.workflow.id, 'response.data.workflow.id')
          assert.exists(
            response.data.workflow.name,
            'response.data.workflow.name',
          )
          assert.exists(
            response.data.workflow.default,
            'response.data.workflow.default',
          )

          assert.isTrue(
            response.data.workflow.default,
            'Workflow default should be true',
          )

          workflowFixture.id = response.data.workflow.id

          done()
        })
        .catch(done)
    })

    it('should update workflow', function (done) {
      workflowFixture.status['approve'] = {}

      const client = new EmmlyClient()
      client
        .query(
          `mutation workflow($workflow: JSON!, $repositorySlug: String!) { 
                workflow(workflow: $workflow, repositorySlug: $repositorySlug) {
                    id 
                    name
                    status
                }
            }`,
          {
            workflow: workflowFixture,
            repositorySlug: repositoryFixture.id,
          },
        )
        .then(function (response: EmmlyResponse) {
          assert.isNotNull(response, 'No response object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          assert.exists(
            response.data.workflow.status['approve'],
            'Step not added',
          )

          done()
        })
        .catch(done)
    })
  })
}
