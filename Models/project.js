import mongoose from 'mongoose'

const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    managerId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Users'
    },
    tasks: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Tasks'
    }],
    createdAt: {
        type: String,
    }
},{
    timestamps:true,
    timeseries:true
})

const Project = mongoose.model('Projects', ProjectSchema);
export default Project;