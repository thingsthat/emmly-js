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
import modelsCreate from './models/create'
import modelsDelete from './models/delete'
import modelsQuery from './models/query'
import respositoriesCreate from './respositories/create'
import respositoriesOptions from './respositories/options'
import respositoriesUpdate from './respositories/update'
import workflowCreate from './workflow/create'
import workflowDelete from './workflow/delete'

general()

// Repositories
respositoriesCreate()
respositoriesUpdate()
respositoriesOptions()

// Models
modelsCreate()
modelsQuery()

// Content and media with default workflow
contentDefault()

// Actions
actionsCreate()

// Custom workflow
workflowCreate()

// Content with custom workflow
contentCreate()

// Revisions with custom workflow
contentRevisions()

// Revisions Workflow
contentRevisionsWorkflow()

// Content media
mediaDefault()

// Queries
contentQuery()

contentRevisionsQuery()

// Action Execute - Image Resize
actionsExecute()

// Clear up
contentDelete()
actionsDelete()
modelsDelete()
workflowDelete()
