import User from "../Models/user.js";
import OTP from '../Models/otp.js'
import cloudinary from '../Helpers/utilfile.js'

// import cloudinary from 'cloudinary'
import Jwt from "jsonwebtoken";
import Moment from 'moment'
import bcrypt from 'bcrypt'

import { otpGen, verifyOtp } from '../Helpers/otp.js'
import { forgotPassword } from '../Helpers/forgotPassword.js'



export const getManager = async (req, res) => {
    try {
        const manager = await User.findOne({ email: req.body.email }).select('name email _id image _id')

        if (manager) {
            const user = {
                fname: manager.name,
                email: manager.email,
                _id: manager._id,
                image:manager.image.url
            }
            res.status(200).json(user)
        } else {
            res.status(404).json('User not found')
        }
    } catch (error) {
        res.status(401).json('Authentication error')
    }
}

export const updateManager = async (req, res) => {
    try {
        const manager = await User.findOne({ email: req.body.email }).select('name email _id')
        const { fname } = req.body
        if (manager) {
            await manager.updateOne({ $set: { name: fname } })
            const user = {
                fname: fname,
                email: manager.email,
                _id: manager._id
            }
            res.status(200).json(user)
        } else {
            res.status(404).json('User not found')
        }
    } catch (error) {
        res.status(401).json('Authentication error')
    }
}

export const getVerified = async (req, res) => {
    try {
        const data = req.body
        const user = await User.findOne({ email: data.email })
        if (user) {
            const decoded = Jwt.verify(data.token, process.env.jwtSecret);
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

export const register = async (req, res) => {
    try {
        const email = req.body.email
        const password = req.body.password
        const name = req.body.name

        const record = await User.findOne({ email: email })
        if (record) {
            res.status(400).json('Email is already registered')
        } else {
            otpGen(email).then((otp) => {
                res.status(200).json({
                    name, password, email
                });
            })

        }
    } catch (err) {
        console.log(err);
    }
}

export const storeUser = async (req, res) => {
    try {
        const password = req.body.password
        const name = req.body.name
        const email = req.body.email
        const hashedPassword = await bcrypt.hash(password, 10)
        const otp = req.body.otp

        const record = await User.findOne({ email: email })
        if (record) {
            return res.status(400).send({
                message: 'Email is already registered'
            })
        } else {
            const value = await verifyOtp(otp, email)

            if (value == 'expired') {
                await OTP.findOneAndDelete({ otp: otp })
                res.status(503).send('Expired')
            } else if (value == 'not found') {
                res.status(404).send(value)
            } else {
                const user = new User({
                    email: email,
                    name: name,
                    password: hashedPassword,
                    timeStamp: Moment().format('DD/MM/YYYY')
                })
                await user.save()
                if (user) {
                    res.status(200).json('success')
                }
            }
        }
    } catch (error) {
        console.log(error);
        res.status(error.status).send(error.message)
    }
}

export const forgotPasswordSend = async (req, res) => {
    try {
        const email = req.body.email
        if (email) {
            forgotPassword(email).then((output) => {
                if (output == 'success') {
                    res.json(output)
                } else {
                    console.log('else', output);
                    res.status(404).json(output)
                }
            })
        }
    } catch (error) {
        console.log(error.message);
        res.status(error.status)
    }
}
export const checkForgotToken = async (req, res) => {
    const token = req.query.token
    if (token) {
        const user = await User.findOne({ resetToken: token })
        if (user) {
            await User.findOneAndUpdate({ resetToken: token }, { $set: { resetToken: '', resetTokenExpiration: Date.now() } })
            res.status(200).json({ email: user.email })
        } else {
            res.status(404).json('user not found')
        }
    }
}

export const setToken = async (req, res) => {
    const email = req.body.email
    const password = req.body.password
    const hashedPassword = await bcrypt.hash(password, 10)
    if (email) {
        const user = await User.findOne({ email: email })
        if (user) {
            await User.findOneAndUpdate({ email: email }, { $set: { password: hashedPassword } })
            res.status(200).json('success')
        } else {
            res.status(404)
        }
    }
}

export const login = async (req, res) => {
    const user = await User.findOne({ email: req.body.email })
    const password = req.body.password
    if (!user) {
        return res.status(404).json('User not found')
    } else if (!(await bcrypt.compare(password, user.password))) {
        return res.status(400).json("Password is incorrect")
    } else if (user.status == 'Block') {
        res.status(400).json("This user is blocked")
    } else {
        const token = Jwt.sign({ userId: user._id, email: user.email }, process.env.jwtSecret)

        res.send({
            _id: user._id,
            email: user.email,
            token: token,
            fname: user.name
        })
    }
}

export const profileImage = async (req, res) => {
    try {
        const { email, image } = req.body;

        const user = await User.findOne({ email });

        if (user) {
            console.log(req.body);

            const result = await cloudinary.uploader.upload(image, { folder: 'profile' });
            console.log('Result:', result);
            const { public_id, url } = result
            const updatedImage = {
                public_id: public_id,
                url: url
            }
            const updatedUser = await User.findOneAndUpdate(
                { email },
                { $set: { image: updatedImage } },
                { new: true }
            );
            res.status(200).json(updatedUser)
        } else {
            console.log("User not found for email:", email);
            res.status(error.statusCode).json(error)
        }
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(error.statusCode).json(error)
    }


}