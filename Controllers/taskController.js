import History from "../Models/history.js";
import Project from "../Models/project.js"
import Task from "../Models/tasks.js"
import Assignee from "../Models/employee.js"

import { sendMail } from "../Helpers/mailer.js"
import { getRecentHistory } from "../Helpers/fetchRecent.js";

export const getTask = async (req, res) => {
    try {
        const id = req.params.id
        if (id) {
            const tasks = await Task.find({ managerId: id })
            if (tasks) {
                res.status(200).json(tasks)
            } else {
                res.status(200).json('No data found')
            }
        } else {
            res
                .status(404)
                .json()
        }
    } catch (error) {
        console.log(error)
        res.status(503)
            .json(error)
    }
}

export const createTask = async (req, res) => {
    try {

        const name = req.body.title
        const id = req.params.id
        const exist = await Task.findOne({ title: name })
        if (exist) {
            console.log('already exist');
            res.status(400).json('Task already exist')
        } else {
            const project = await Project.findById(id)
            const newTask = new Task({
                title: name,
                projectId: id,
                managerId: project.managerId
            })

            await newTask.save()
            await History.create({
                content: 'task created',
                doneBy: project.managerId,
                tasks: newTask._id
            })

            Project.findByIdAndUpdate(id,
                {
                    $push: {
                        tasks: newTask._id
                    }
                }).then(() => {
                    res.status(200).json(newTask)
                })
        }

    } catch (error) {
        console.log(error);
        res.status(404)
            .json(error)
    }
}

export const updateTask = async (req, res) => {
    try {
        const id = req.params.id
        const data = req.body
        await Task.findById(id).then(async (details) => {
            const user = {
                id: data.assigneeId,
                task: details
            }
            let change = true
            let content;
            if (details.assigneeId != data.assigneeId) {
                content = 'Updated assignee '
            } else if (details.status != data.status) {
                content = `Updated Status ${data.status}`
            } else if (details.priority != data.priority) {
                content = `Updated priority ${data.priority}`
            } else if (details.dueDate != data.dueDate) {
                content = `Updated due date ${data.dueDate}`
            } else if (details.title != data.title) {
                content = `Updated title ${data.title}`
            } else if (details.description != data.description) {
                content = `Updated description ${data.description}`
            } else {
                change = false
            }
            console.log('content:',content);

            if(change){
                if (data.modifier != undefined) {
                    await History.create({
                        content: content,
                        doneBy: data.modifier,
                        tasks: id
                    })
                } else {
                    await History.create({
                        content: content,
                        doneBy: details.managerId,
                        tasks: id
                    })
                }
    
                if (details.assigneeId != data.assigneeId) {
                    sendMail(user, 'task')
                    await Assignee.findByIdAndUpdate(details.assigneeId, {
                        $push: {
                            tasks: details._id
                        }
                    })
                }
                if (id != undefined) {
                    await Task.findByIdAndUpdate(id,
                        {
                            $set:
                            {
                                title: data.title,
                                modifiedAt: Date.now(),
                                priority: data.priority,
                                description: data.description,
                                status: data.status,
                                dueDate: data.dueDate,
                                assigneeId: data.assigneeId
                            }
                        }
                    )
                    res.status(200).json(data)
                }
            } else {
                res.json(data)
            }
        })
    } catch (error) {
        console.log(error);
        res.status(404).json(error)
    }
}

export const deleteTask = async (req, res) => {
    try {
        if (req.params.id) {
            const id = req.params.id
            const task = await Task.findByIdAndDelete(id)
            let assignee;
            if (task.assigneeId) {
                assignee = await Assignee.findById(task.assigneeId)
                const assignedTask = assignee.tasks
                let taskArray = []
                assignedTask.filter((ids) => {
                    if (ids != id) {
                        taskArray.push(ids)
                    }
                })
                await assignee.updateOne({ $set: { tasks: taskArray } })
            }

            res.status(200).json({ message: 'success' })
        }
    } catch (error) {
        console.log(error);
        res.status(404)
            .json(error)
    }
}

export const getHistory = async (req, res) => {
    try {
        const task_id = req.params.task_id
        if (task_id) {
            const history = await History.find({ tasks: task_id })
            if (history) {
                res.status(200).json(history)
            } else {
                res.status(404).json('No history found')
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).json(error)
    }
}

export const getRecent = async (req, res) => {
    try {
        const managerId = req.params.managerId
        if (managerId) {
            const tasks = await Task.find({ managerId: managerId })
            if (tasks) {
                let taskId = []
                tasks.forEach(data => {
                    taskId.push(data._id)
                })
                const history = await getRecentHistory(taskId)
                const sortedTasks = history.sort((b, a) => {
                    const createdAtA = new Date(a.createdAt);
                    const createdAtB = new Date(b.createdAt);
                    return createdAtA - createdAtB;
                });

                res.status(200).json(history)

            } else {
                res.status(404).json('No tasks found')
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).json(error)
    }
}


export const getAllTask = async (rea, res) => {
    try {
        const tasks = await Task.find()
        if (tasks) {
            res.status(200).json(tasks)
        } else {
            res.status(404).json('No data found')
        }

    } catch (error) {
        console.log(error)
        res.status(503)
            .json(error)
    }
}