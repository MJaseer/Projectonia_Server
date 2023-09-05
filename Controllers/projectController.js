import Project from "../Models/project.js";
import Task from "../Models/tasks.js";
import User from "../Models/user.js"

export const newProject = async (req, res) => {
    try {
        const managerId = req.params.id

        const data = req.body
        const newProject = new Project({
            title: data.title,
            managerId: managerId
        })
        await newProject.save();
        await User.findByIdAndUpdate(managerId, { $push: { projects: newProject._id } })
        res.send(newProject)

    } catch (error) {

        console.log(error);
        res.statusCode(500).send(error)
    }
}

export const getProject = async (req, res) => {
    try {
        const managerId = req.params.id

        const data = await Project.find({ managerId: managerId }).populate({
            path: 'tasks',
            model: 'Tasks'
        })
        if (data.length < 1) {
            const dummy = [{
                _id: 0,
                title: 'No Project Available',
                tasks: [],
                __v: 0
            }]
            res.send(dummy)

        } else {
            res.send(data)

        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }
}

export const deleteProject = async (req, res) => {
    try {
        if (req.params.id) {
            const id = req.params.id
            const project = await Project.findById(id)
            const user = await User.findById(project.managerId)
            user.projects.filter((projetcs) => {

                if (projetcs._id != id) {
                    afterDelete.push(projetcs._id)
                }
            })
            // for(let item of project){
                
            // }
            let afterDelete = []
            await user.updateOne({ $set: { projects: afterDelete } })
            await project.deleteOne()
            res.send({ message: 'success' })
        }
    } catch (error) {
        console.log(error);
        res.statusCode(404)
            .send(error)
    }
}

export const getAllProject = async (req, res) => {
    try {

        const data = await Project.find().populate({
            path: 'tasks',
            model: 'Tasks'
        })
        if (data.length < 1) {
            const dummy = [{
                _id: 0,
                title: 'No Project Available',
                tasks: [],
                __v: 0
            }]
            res.send(dummy)

        } else {
            res.send(data)

        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }
}