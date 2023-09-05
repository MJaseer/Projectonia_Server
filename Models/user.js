import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    assignee: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Assignees'
    }],
    projects: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Projects'
    }],
    status:{
        type:String,
        default:'UnBlock'
    },
    resetToken:String,
    resetTokenExpiration:Date,
    image:{
        url:String,
        public_id:String
    }
},{
    timestamps:true,
    timeseries:true
})

const user = mongoose.model('Users', userSchema);
export default user;