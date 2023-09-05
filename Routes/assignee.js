import express from 'express'
import { loginAsignee } from '../Controllers/assigneeController.js'
// import Moment from 'moment'
// import Project from '../Models/project.js'
// import Task from '../Models/tasks.js'

const router = express.Router()

router.post('/login', loginAsignee)

export default router;