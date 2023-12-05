import dotenv from 'dotenv'

import actionsCreate from './actions/create'
import actionsDelete from './actions/delete'
import actionsExecute from './actions/execute'
import contentCreate from './content/create'
import contentDefault from './content/default'
import contentDelete from './content/delete'
import contentQuery from './content/query'
import contentRevisions from './content/revisions'
import contentRevisionsQuery from './content/revisions-query'
import contentRevisionsWorkflow from './content/revisions-workflow'
import general from './general'
import mediaDefault from './media/media-default'
import {
  getMockAction,
  getMockContent,
  getMockContentEmpty,
  getMockModel,
  getMockRepository,
  getMockRevision,
  getMockWorkflow,
} from './mock'
import modelsCreate from './models/create'
import modelsDelete from './models/delete'
import modelsQuery from './models/query'
import respositoriesCreate from './respositories/create'
import respositoriesOptions from './respositories/options'
import respositoriesUpdate from './respositories/update'
import workflowCreate from './workflow/create'
import workflowDelete from './workflow/delete'

const mockRepository = getMockRepository()
const mockWorkflow = getMockWorkflow()
const mockModel = getMockModel()
const mockAction = getMockAction()
const mockRevision = getMockRevision()

const mockContent = getMockContent(mockRepository)
const mockContent2 = getMockContent(mockRepository)
const mockContent3 = getMockContentEmpty()
const mockContent4 = getMockContent(mockRepository)

dotenv.config()

general()

// Repositories
respositoriesCreate(mockRepository)
respositoriesUpdate(mockRepository)
respositoriesOptions(mockRepository)

// Models
modelsCreate(mockRepository, mockModel)
modelsQuery(mockRepository)

// Content and media with default workflow
contentDefault(mockRepository, mockContent2)

// Actions
actionsCreate(mockRepository, mockAction)

// Custom workflow
workflowCreate(mockRepository, mockWorkflow)

// Content with custom workflow
contentCreate(mockRepository, mockContent, mockContent4, mockRevision)

// Revisions with custom workflow
contentRevisions(mockContent)

// Revisions Workflow
contentRevisionsWorkflow(mockRevision)

// Content media
mediaDefault(mockRepository, mockContent3)

// Queries
contentQuery(mockRepository, mockContent)

contentRevisionsQuery(mockRepository, mockContent)

// Action Execute - Image Resize
actionsExecute(mockRepository, mockAction, mockContent3)

// Clear up
contentDelete(
  mockRepository,
  mockContent,
  mockContent2,
  mockContent3,
  mockContent4,
)
actionsDelete(mockAction)
modelsDelete(mockRepository, mockModel)
workflowDelete(mockWorkflow)
