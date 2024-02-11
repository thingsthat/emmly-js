import {
  IAction,
  IContent,
  IModel,
  IRepository,
  IWorkflow,
} from '../../src/types/emmly'

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

export const getMockModel = (): IModel => {
  return {
    name: `test-model${getUniqueMockName()}`,
    fields: [
      {
        type: 'text',
        name: 'title',
        label: 'Title',
      },
      {
        type: 'text',
        name: 'description',
        label: 'Description',
      },
    ],
  }
}

export const getMockRepository = (): IRepository => {
  return {
    name: `repository${getUniqueMockName()}`,
    options: null,
    primaryLanguage: 'en',
  }
}

export const getMockAction = (): IAction => {
  return {
    type: 'imageresize',
    name: 'test-image-main',
    options: {
      format: 'jpg',
      height: 670,
      quality: 80,
      suffix: '-main',
      width: 1200,
    },
  }
}

export const getMockWorkflow = (): IWorkflow => {
  return {
    name: 'test-workflow',
    status: {
      draft: {
        draft: true,
        next: 'published',
      },
      published: {
        publish: true,
      },
    },
  }
}

export const getMockRevision = () => {
  return {
    id: null,
  }
}
