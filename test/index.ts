import dotenv from 'dotenv'

import contentDefault from './content/default'
import contentDelete from './content/delete'
import contentQuery from './content/query'
import contentRevisionsQuery from './content/revisionsQuery'
import general from './general'
import mediaDefault from './media/mediaDefault'
import { getMockContent, getMockContentEmpty, getMockRepository } from './mock'
import modelsQuery from './models/query'
import respositoriesCreate from './respositories/create'
import respositoriesOptions from './respositories/options'
import respositoriesUpdate from './respositories/update'

const mockRepository = getMockRepository()

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
modelsQuery(mockRepository)

// Content and media with default workflow
contentDefault(mockRepository, mockContent2)

// Content media
mediaDefault(mockRepository, mockContent3)

// Queries
contentQuery(mockRepository, mockContent2)

contentRevisionsQuery(mockRepository, mockContent2)

// Clear up
contentDelete(mockRepository, mockContent2, mockContent3, mockContent4)
