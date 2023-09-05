import crypto from 'crypto'
import User from '../Models/user.js'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });


export async function forgotPassword(email) {
    try {
        const buffer = crypto.randomBytes(32)
        const token = buffer.toString('hex')
        const users = await User.findOne({ email: email })
        if (users) {
            users.resetToken = token;
            users.resetTokenExpiration = Date.now() + 3600000
            await users.save()
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.mailerAuthUser,
                    pass: process.env.mailerAuthPass
                }
            })
            let mailOptions = {
                from: ` projectonia07@gmail.com `,
                to: email,
                subject: 'Password reset',
                html: `
                        <p>You Requested  a Password reset </p>
                         <p>Click this <a href="http://localhost:4200/newPassword?token=${token}">link</a> to reset your password.</p>
                 `
            }
            console.log('We have send an email to your email Id, It may be in spam messages');
            const data = await transporter.sendMail(mailOptions)
            if (!data) {
                console.log(data, 'error mailer');
                return data
            } else {
                return 'success'
            }
        } else {
            console.log('user not found');
            return 'not found'
        }
    } catch (error) {
        console.log(error, 'catched final error');
        return error
    }

}