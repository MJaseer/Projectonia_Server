import Jwt from "jsonwebtoken";

import User from '../Models/user.js'

export const getVerified = async (req, res) => {
    try {
        const data = req.body
        if (data) {
            const decoded = Jwt.verify(data.token, process.env.jwtAdminSecret);
            if (decoded) {
                res.status(200).json('success')
            } else {
                res.status(400).json('Authentication error')
            }
        } else {
            res.status(404).json("User not found")
        }
    } catch (error) {
        console.log(error);
        res.status(503).json(error)
    }
}

export const adminLogin = (req, res) => {
    const data = req.body
    if (data.email == process.env.adminEmail && data.password == process.env.adminPassword) {
        const token = Jwt.sign({ userId: data.password, email: data.email }, process.env.jwtAdminSecret)

        res.send({
            admin: 'admin',
            email: 'jaseer@gmail.com',
            token: token
        })
    } else {
        res.status(400).json('Invalid Credentials')
    }
}

export const getUsers =  async (req, res) => {
    try {
        const managerDet = await User.find()
        if (managerDet) {
            res.status(200).send(managerDet)
        } else {
            res.status(404).json('No user found')
        }
    } catch (error) {
        console.log(error.message);
        res.status(error.status).send(error.message)
    }


}

export const blockUser =  async (req, res) => {
    try {
        const manager = await User.findById(req.params.id)
        const id = req.params.id
        const updatedManager = req.body
        if (manager) {
            await User.findByIdAndUpdate(id, {
                $set: {
                    status: updatedManager.status
                }
            })
            res.status(200).send(updatedManager)
        } else {
            res.status(404).json('User not found')
        }
    } catch (error) {
        console.log(error.message);
        res.status(error.status).send(error.message)
    }
}