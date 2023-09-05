import nodemailer from 'nodemailer'
import dotenv from 'dotenv';
import Assignee from '../Models/employee.js';
dotenv.config({ path: '.env' });

export async function sendMail(data, purpose) {
    try {
        console.log(data.id);
        const users = await Assignee.findById(data.id)
        if (users) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.mailerAuthUser,
                    pass: process.env.mailerAuthPass
                }
            })
            let mailOptions
            if (purpose == 'task') {
                mailOptions = {
                    from: ` projectonia07@gmail.com `,
                    to: users.email,
                    subject: 'New Task',
                    html: `
                            <p>Your Manager assigned a New Task For you, Please complete it before due date</p>
                            <p>Click this <a href="http://localhost:4200/employee/tasks">link</a> to see the task.</p>
                     `
                }
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
