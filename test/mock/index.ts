import { IContent, IRepository } from '../../src/types/emmly'

export const getUniqueMockName = () => new Date().getTime()

export const getMockContent = (mockRepository: IRepository): IContent => {
  return {
    name: `test-content${getUniqueMockName()}`,
    data: {
      test: 'test',
    },
    repository: mockRepository.id,
    tags: ['TEST1', 'Test2'],
  }
}

export const getMockContentEmpty = (): IContent => {
  return {
    data: {},
  }
}

export const getMockRepository = (): IRepository => {
  return {
    name: `repository${getUniqueMockName()}`,
    options: null,
    primaryLanguage: 'en',
  }
}

export const getMockRevision = () => {
  return {
    id: null,
  }
}
