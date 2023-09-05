import chatRoomModel from "../Models/conversation.js";


export async function chatRoomFinder(sender_id, receiver_id) {

    const { _id } = await chatRoomModel.findOne({
        $or: [
            { sender_id: sender_id, receiver_id: receiver_id },
            { sender_id: receiver_id, receiver_id: sender_id },
        ],
    });
    if (_id) {
        console.log(_id);
        return _id
    } else {
        return null
    }
}
