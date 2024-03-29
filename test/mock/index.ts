import { IContent, IRepository } from '../../src/types/emmly'

export const getUniqueMockName = () => Date.now()

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
    options: {},
    primaryLanguage: 'en',
  }
}

export const getMockRevision = () => {
  return {
    id: null,
  }
}

export const mockRepository = getMockRepository()

export const mockContent = getMockContent(mockRepository)
export const mockContent2 = getMockContent(mockRepository)
export const mockContent3 = getMockContent(mockRepository)
