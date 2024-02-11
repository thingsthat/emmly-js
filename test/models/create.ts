import { assert } from 'chai'

import { EmmlyClient, EmmlyResponse } from '../../src'
import { IModel, IRepository } from '../../src/types/emmly'

export default (mockRepository: IRepository, mockModel: IModel) => {
  describe('Emmly models', function () {
    it('should create model', function (done) {
      const client = new EmmlyClient()
      client
        .query(
          `mutation model($model: JSON!, $repositorySlug: String!) { 
                            model(model: $model, repositorySlug: $repositorySlug) {
                                id 
                                name 
                                fields
                            }
                        }`,
          {
            model: mockModel,
            repositorySlug: mockRepository.id,
          },
        )
        .then(function (response: EmmlyResponse) {
          assert.isNotNull(response, 'No response object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          mockModel.id = response.data.model.id

          done()
        })
        .catch(done)
    })

    it('should update model', function (done) {
      // Add field
      mockModel.fields.push({
        type: 'image',
        name: 'image',
        label: 'Image',
      })

      const client = new EmmlyClient()
      client
        .query(
          `mutation model($model: JSON!, $repositorySlug: String!) { 
                            model(model: $model, repositorySlug: $repositorySlug) {
                                id 
                                name 
                                fields
                            }
                        }`,
          {
            model: mockModel,
            repositorySlug: mockRepository.id,
          },
        )
        .then(function (response: EmmlyResponse) {
          assert.isNotNull(response, 'No response object')
          assert.exists(response.data, 'Response has no data object')
          assert.notExists(response.errors, 'Has errors')

          assert.strictEqual(
            response.data.model.fields.length,
            3,
            'Field length not 3',
          )

          done()
        })
        .catch(done)
    })

    it('should create model', function (done) {
      const client = new EmmlyClient()
      client
        .query(
          `mutation model($model: JSON!, $repositorySlug: String!) { 
                    model(model: $model, repositorySlug: $repositorySlug) {
                        id 
                        name 
                        fields
                    }
                }`,
          {
            model: mockModel,
            repositorySlug: mockRepository.id,
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
  })
}
