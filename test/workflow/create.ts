import { assert } from 'chai'

import { EmmlyClient, EmmlyResponse } from '../../src'
import { IRepository } from '../../src/types/repository'
import { IWorkflow } from '../../src/types/workflow'

export default (mockRepository: IRepository, mockWorkflow: IWorkflow) => {
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
            repositorySlug: mockRepository.id,
            workflow: mockWorkflow,
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

          mockWorkflow.id = response.data.workflow.id

          done()
        })
        .catch(done)
    })

    it('should update workflow', function (done) {
      mockWorkflow.status['approve'] = {}

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
            repositorySlug: mockRepository.id,
            workflow: mockWorkflow,
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
