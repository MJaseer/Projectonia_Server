import mongoose from 'mongoose'

const HistorySchema = new mongoose.Schema({
    content: {
        type: String,    },
    doneBy: {
        type: mongoose.SchemaTypes.ObjectId,
    },
    tasks: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Tasks'
    },
    createdAt: {
        type: String,
        default:new Date()
    }
},{
    timestamps:true,
    timeseries:true
})

const History = mongoose.model('Historys', HistorySchema);
export default History;