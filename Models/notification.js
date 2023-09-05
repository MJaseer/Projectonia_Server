import mongoose from 'mongoose'

const NotificationSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    notifiedBy: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Users'
    },
    notifiedTo:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Assignee'
    },
    tasks: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Tasks'
    },
},{
    timestamps:true,
    timeseries:true
})

const Notification = mongoose.model('Notifications', NotificationSchema);
export default Notification;