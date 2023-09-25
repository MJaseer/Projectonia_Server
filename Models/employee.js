import mongoose from 'mongoose'

const AssigneeSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: true
    },
    lname: {
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
    phone: {
        type: Number,
        required: true
    },
    place: {
        type: String,
        required: true
    },
    post: {
        type: String,
        required: true
    },
    skill: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    status: {
        type: Boolean,
        default:true
    },
    managerId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Users"
    },
    tasks: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Tasks",
    }],
    timeStamp: String,
},{
    timestamps:true,
    timeseries:true
})

const Assignee = mongoose.model('Assignees', AssigneeSchema);
export default Assignee;