import dotenv from 'dotenv'

import contentCreate from './content/create'
import contentDelete from './content/delete'
import contentQuery from './content/query'
import contentRevisionsQuery from './content/revisionsQuery'
import general from './general'
import mediaDefault from './media/mediaDefault'
import modelsQuery from './models/query'
import respositoriesCreate from './respositories/create'
import respositoriesOptions from './respositories/options'
import respositoriesUpdate from './respositories/update'

dotenv.config()

general()

// Repositories
respositoriesCreate()
respositoriesUpdate()
respositoriesOptions()

// Models
modelsQuery()

// Content and media with default workflow
contentCreate()

// Content media
mediaDefault()

// Queries
contentQuery()

contentRevisionsQuery()

// Clear up
contentDelete()
