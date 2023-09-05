import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// Create Schema for Users
const ConversationSchema = new Schema({
    receiver_id: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
    },
    sender_id: {
        type: Schema.Types.ObjectId,
        ref: 'Assignees',
    },
    readReciept: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    timeseries: true
})

const chatRoomModel = mongoose.model('chatRoom', ConversationSchema);
export default chatRoomModel