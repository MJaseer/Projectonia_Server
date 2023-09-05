import mongoose from 'mongoose'

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: Number
    },
    expiredAt: {
        type: Date
    }
},{
    timestamps:true,
    timeseries:true
})

const OTP = mongoose.model('OTPs', OTPSchema);
export default OTP;