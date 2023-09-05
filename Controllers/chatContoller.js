import messageModel from "../Models/message.js";
import chatRoomModel from "../Models/conversation.js";

export const createNewChatRoom = async (req, res) => {
  try {
    // const sender_id = await Jwt.verify(
    //   req.cookies.userAuthToken,
    //   process.env.JWT_SIGNATURE
    // )?._id;
    const { sender_id } = req.body
    const { receiver_id } = req.body
    if (sender_id && receiver_id) {
      const chatCheck = await chatRoomModel.findOne(
        {
          $or: [{
            $and:
              [
                { sender_id: sender_id },
                { receiver_id: receiver_id }
              ]
          },
          {
            $and:
              [
                { sender_id: receiver_id },
                { receiver_id: sender_id }
              ]
          }]
        })
      if (!chatCheck) {
        await chatRoomModel.updateOne(
          {
            $or: [
              { sender_id: sender_id, receiver_id: receiver_id },
              { sender_id: receiver_id, receiver_id: sender_id },
            ],
          },
          {
            $setOnInsert: { sender_id: sender_id, receiver_id: receiver_id },
          },
          {
            upsert: true,
            setDefaultsOnInsert: true,
          }
        );
      }

      console.log('room created');
      res.json({ success: true });
    } else {
      res.status(503).json('Room creation failed')
    }
  } catch (error) {
    console.log("Error", error);
    res.json({ success: false });
  }
};

export const storeMessages = async (req, res) => {
  try {
    const { receiver_id, message, sender_id } = req.body;
    const chatRoom = await chatRoomModel.findOne({
      $or: [
        { sender_id: sender_id, receiver_id: receiver_id },
        { sender_id: receiver_id, receiver_id: sender_id },
      ],
    });
    await chatRoom.updateOne({ $set: { readReciept: false } })
    await messageModel.create({
      chatRoom_id: chatRoom._id,
      user_id: sender_id,
      message: message,
    });
  } catch (error) {
    console.log("Error", error);
  }
};

export const getAllMessageReceivers = async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const data = await chatRoomModel
      .find({ $or: [{ sender_id: user_id }, { receiver_id: user_id }] })
      .populate("receiver_id sender_id")
      .lean();

    const receiversData = data.map((item) => {
      if (user_id === item.sender_id._id.toString()) {
        return {
          room_id: item._id,
          receiver: item.receiver_id.name,
        };
      } else {
        return {
          room_id: item._id,
          receiver: item.sender_id.name,
        };
      }
    });
    res.json(receiversData);
  } catch (error) {
    console.log("Error", error);
  }
};

export const getChatMessages = async (req, res) => {
  try {
    const { receiver_id, sender_id } = req.params;
    const roomDetail = await chatRoomModel.findOne({
      $or: [
        { sender_id: sender_id, receiver_id: receiver_id },
        { sender_id: receiver_id, receiver_id: sender_id },
      ],
    });
    const data = await messageModel
      .find({ chatRoom_id: roomDetail._id })
      .sort({ createdAt: 1 });

    const lastMessage = await messageModel
      .findOne({ chatRoom_id: roomDetail._id })
      .sort({ createdAt : -1 }) 
      const flaseId = lastMessage.user_id.toString()
    console.log( sender_id,flaseId);
    if (flaseId != sender_id) {
      await roomDetail.updateOne({ $set: { readReciept: true } })
    }

    const messages = data.map((item) => {
      if (item.user_id.toString() === sender_id) {
        return {
          user: "sender",
          message: item.message,
          time: item.createdAt
        };
      } else {
        return {
          user: "receiver",
          message: item.message,
          time: item.createdAt
        };
      }
    });
    res.json({messages,roomDetail});
  } catch (error) {
    console.log("Eror", error);
  }
};
