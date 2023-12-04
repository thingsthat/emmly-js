const uniqueTestName = new Date().getTime()

type Repository = {
  id?: string
  name: string
  options: any
  primaryLanguage: string
}

export const repositoryFixture: Repository = {
  name: `repository${uniqueTestName}`,
  options: null,
  primaryLanguage: 'en',
}

type Action = {
  type: string
  id?: string
  name: string
  options: any
}

export const actionFixture: Action = {
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

type Content = {
  type?: string
  id?: string
  name: string
  data: any
  repository?: string
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
  imageContentId: null,
  revisionId: null,
}
