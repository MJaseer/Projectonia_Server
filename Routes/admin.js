import express from 'express'
import { adminLogin, blockUser, getUsers, getVerified } from '../Controllers/adminController.js'
import { getAllProject } from '../Controllers/projectController.js'
import { getAllTask } from '../Controllers/taskController.js'

const router = express.Router()

router.post('/login', adminLogin)

router.get('/getUsers',getUsers)

router.patch('/block/:id',blockUser)

router.post('/getVerified', getVerified)

router.get('/getProject',getAllProject)

router.get('/getAllTask',getAllTask)

export default router;