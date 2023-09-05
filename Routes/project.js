import express from 'express'

import { deleteProject, getProject, newProject } from '../Controllers/projectController.js'


const router = express.Router()

router.post('/newProject/:id', newProject)

router.get('/getProject/:id', getProject)

router.delete('/deleteProject/:id', deleteProject)

export default router;