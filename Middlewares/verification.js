import Jwt from "jsonwebtoken";
import User from "../Models/user.js";
import Assignee from "../Models/employee.js";


export const verifyUser = async (req, res, next) => {
    try {
        const token = req.headers['token']
        if (token) {
            const decoded = Jwt.verify(token, process.env.jwtSecret);
            if (decoded) {
                const user = await User.findById(decoded.userId)
                if (user) {
                    next()
                }
            } else {
                console.log('jwt not verified');
                res.status(403).json('Jwt authentication failed')
            }
        }
    } catch (error) {
        console.log(error);
        res.status(error.statusCode).json(error)
    }

}

export const verifyAssignee = async (req, res, next) => {
    try {
        const token = req.headers['token']
        if (token) {
            const decoded = Jwt.verify(token, process.env.jwtSecret);
            if (decoded) {
                const user = await Assignee.findById(decoded.userId)
                if (user) {
                    next()
                }
            } else {
                console.log('jwt not verified');
                res.status(403).json('Jwt authentication failed')
            }
        }
    } catch (error) {
        console.log(error);
        res.status(error.statusCode).json(error)
    }

}