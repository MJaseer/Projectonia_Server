import Assignee from '../Models/employee.js'

import bcrypt from 'bcrypt'
import Moment from 'moment'
import Jwt from "jsonwebtoken";
import User from '../Models/user.js';


export const addAssignee = async (req, res) => {
    const data = req.body
    const managerId = req.params.id

    let hashedPassword;
    bcrypt.hash(req.body.password, 10, async (err, hash) => {
        if (err) {
            console.log(err.message);
            res.status(503)
                .send({ message: `Error occured ${err}` })
        } else {
            const check = await Assignee.findOne({ email: data.email })
            if (check) {
                res.status(400).json('Email is already registered')
            } else {
                hashedPassword = hash
                const Assigne = new Assignee({
                    fname: data.fname,
                    lname: data.lname,
                    email: data.email,
                    password: hashedPassword,
                    phone: data.phone,
                    place: data.place,
                    post: data.post,
                    skill: data.skill,
                    timeStamp: Moment().format('DD/MM/YYYY'),
                    managerId: managerId
                })

                await Assigne.save()
                await User.findByIdAndUpdate(managerId, {
                    $set: { assignee: managerId }
                })
                res.send(Assigne)
            }
        }
    })

}

export const getAssignee = async (req, res) => {
    try {
        const managerId = req.params.id
        const assignee = await Assignee.find({ managerId: managerId })
        res.send(
            assignee
        )
    } catch (err) {
        console.log(err);
        res.status(404)
            .send({
                message: err
            })
    }
}

export const editAssignee = async (req, res) => {
    try {
        const id = req.params.id
        const data = req.body
        if (data) {
            const assignee = await Assignee.findById(id)
            if (assignee) {
                const update = await Assignee.findByIdAndUpdate(id,
                    {
                        $set: {
                            fname: data.fname,
                            lname: data.lname,
                            phone: data.phone,
                            place: data.place,
                            post: data.post,
                            skill: data.skill
                        }
                    })
                console.log(update, 'after');
                res.send(
                    update
                )
            } else {
                res.status(404).json('Assignee Not found')
            }
        }
    } catch (err) {
        res.status(500)
            .send({ message: err })
    }
}

export const deleteAssignee = async (req, res) => {
    try {
        const id = req.params.id
        if (id) {
            const assignee = await Assignee.findByIdAndDelete(id)
            const managerId = assignee.managerId
            const manager = await User.findById(managerId)
            let assigneeArray = []
            manager.assignee.filter((ids) => {
                if (ids != id) {
                    assigneeArray.push(ids)
                }
            })
            await manager.updateOne({ $set: { assignee: assigneeArray } })
            res.status(200).send({ message: 'success' })
        } else {
            res.status(404).send('not found')
        }

    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }
}

export const loginAsignee = async (req, res) => {
    try {
        const data = req.body
        const password = data.password
        const employee = await Assignee.findOne({ email: data.email })
        if (employee) { 
            const token = Jwt.sign({ userId: employee._id, email: employee.email }, process.env.jwtSecret)
            if ((await bcrypt.compare(password, employee.password))) {
                res.send({
                    _id: employee._id,
                    email: employee.email,
                    token: token,
                    fname: employee.fname,
                    managerId: employee.managerId
                })
            } else {
                res.status(500).json('Password incorrect')
            }
        } else {
            res.status(404).json('Employee not found')
        }
    } catch (error) {
        console.log(error);
        res.status(404).json(error.message)
    }

}