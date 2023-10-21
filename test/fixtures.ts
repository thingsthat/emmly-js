const uniqueTestName = new Date().getTime()

type Repository = {
  id?: string
  primaryLanguage: string
  name: string
  options: any
}

export const repositoryFixture: Repository = {
  primaryLanguage: 'en',
  name: `repository${uniqueTestName}`,
  options: null,
}

type Action = {
  id?: string
  name: string
  type: string
  options: any
}

export const actionFixture: Action = {
  name: 'test-image-main',
  type: 'imageresize',
  options: {
    width: 1200,
    format: 'jpg',
    height: 670,
    quality: 80,
    suffix: '-main',
  },
}

type Workflow = {
  id?: string
  name: string
  status: any
}

export const workflowFixture: Workflow = {
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

type Model = {
  id?: string
  name: string
  fields: any
}

export const modelFixture: Model = {
  name: 'testmodel',
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
    },
    {
      name: 'description',
      type: 'text',
      label: 'Description',
    },
  ],
}

type Content = {
  id?: string
  repository?: string
  name: string
  type?: string
  data: any
  tags?: string[]
}

export const contentFixture: Content = {
  name: 'test-content1',
  data: {
    test: 'test',
  },
  tags: ['TEST1', 'Test2'],
}

export const contentFixture2: Content = {
  name: 'test-content2',
  data: {
    test: 'test',
  },
}

export const fixture = {
  revisionId: null,
  imageContentId: null,
}
