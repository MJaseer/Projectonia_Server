import mongoose from 'mongoose'

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    projectId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Projects"
    },
    description: {
        type: String,
        default:"No description available"
    },
    managerId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Users"
    },
    status: {
        type: String,
        default: "Gray"
    },
    assigneeId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Assignees",
    },
    dueDate: {
        type: String,
        default:'NIL'
    },
    priority: {
        type: String,
        default:'Blue'
    },
    attachments: [{
        path: {
            type: String,
            default:'NIL'
        }
    }],
},{
    timestamps:true,
    timeseries:true
})

const tasks = mongoose.model('Tasks', TaskSchema);
export default tasks;