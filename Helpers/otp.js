import nodemailer from 'nodemailer'
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import OTP from '../Models/otp.js'
// import Moment from 'moment'

export async function otpGen(email) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.mailerAuthUser,
                pass: process.env.mailerAuthPass
            }
        })
        const emailOtp = email;
        const freshOTP = `${Math.floor(100000 + Math.random() * 9000)}`
        const expiration = new Date();
        expiration.setMinutes(expiration.getMinutes() + 5);
        const newOTP = new OTP({
            email: emailOtp,
            expiredAt: expiration,
            otp: freshOTP
        })

        await newOTP.save()

        const mailOptions = {
            from: 'projectonia07@gmail.com',
            to: email,
            subject: 'OTP for Projectonia Signup Proccess',
            text: `Your OTP is: ${freshOTP}`
        };
        const data = await transporter.sendMail(mailOptions)
        if (!data) {
            console.log(data);
            return false
        } else {
            console.log(`OTP sent to ${email}: ${freshOTP}`);
            return freshOTP
        }

    } catch (error) {
        console.log(error);
        return error
    }

}

export async function verifyOtp(otp, email) {
    try {
        const data = await OTP.findOne({ otp: otp })
            if (data) {
                if (data.expiredAt > Date.now()) {
                    if (data.email == email) {
                        await OTP.findOneAndDelete({ email: email })
                        console.log('deleted');
                        return true
                    }
                } else {
                    return 'expired'
                }
            } else {
                return 'not found'
            }
        
    } catch (error) {
        return false
    }


}
