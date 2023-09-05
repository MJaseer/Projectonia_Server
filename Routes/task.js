import express from 'express'
import { createTask, deleteTask, getHistory, getRecent, getTask, updateTask } from '../Controllers/taskController.js'


const router = express.Router()

router.get('/getTask/:id', getTask)

router.post('/createTask/:id',createTask)

router.put('/updateTask/:id', updateTask)

router.delete('/deleteTask/:id', deleteTask)

router.get('/getHistory/:task_id', getHistory)

router.get('/getRecent/:managerId',getRecent)


export default router;