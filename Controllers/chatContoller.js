import messageModel from "../Models/message.js";
import chatRoomModel from "../Models/conversation.js";
import Assignee from "../Models/employee.js"

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
    res.status(200).json('success')
  } catch (error) {
    console.log("Error", error);
    res.status(500).json(error)
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
      .sort({ createdAt: -1 })
    const flaseId = lastMessage?.user_id?.toString()
    console.log(sender_id, flaseId);
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
    res.json({ messages, roomDetail });
  } catch (error) {
    console.log("Eror", error);
  }
};

export const getChaters = async (req, res) => {
  try {
    const id = req.params.id
    const assigne = await Assignee.findById(id)
    let managerId;
    let userData = []
    let chatRoomIds = []

    if (assigne) {
      managerId = assigne?.managerId
      const roomDetail = await chatRoomModel.findOne({
        $or: [
          { sender_id: managerId, receiver_id: id },
          { sender_id: id, receiver_id: managerId },
        ],
      });
      if (roomDetail) {
        chatRoomIds.push(roomDetail._id)
        userData.push({ readed: roomDetail.readReciept, fname: 'Manager', user_id: managerId })
      } else {
        userData.push({ readed: false, fname: 'Manager', user_id: managerId })
      }
    } else {
      managerId = id
    }
    if (managerId) {


      const users = await Assignee.find({ managerId: managerId })
      if (users) {
        for (const assigne of users) {
          if (assigne._id != id) {
            const roomDetail = await chatRoomModel.findOne({
              $or: [
                { sender_id: assigne._id, receiver_id: id },
                { sender_id: id, receiver_id: assigne._id },
              ],
            });
            if (roomDetail) {
              chatRoomIds.push(roomDetail._id)
              userData.push({ readed: roomDetail.readReciept, fname: assigne.fname, user_id: assigne._id })
            } else {
              userData.push({ readed: false, fname: assigne.fname, user_id: assigne._id })
            }

          }
        }
      }
      const messageDetail = await messageModel.aggregate([
        {
          $match: {
            chatRoom_id: { $in: chatRoomIds }
          }
        },
        {
          $group: {
            _id:'$user_id',
            // chatRoom_id: '$chatRoom_id',
            latestTime: { $max: '$createdAt' },
            latestData: { $last: '$message' },
          },
        },
        {
          $project: {
            _id: 0,
            userid: '$_id',
            // chatRoomId:'$chatRoom_id',
            data: '$latestData',
            time: '$latestTime',
          },
        },
      ]);
      const readStatusMap = new Map();
      for (const status of userData) {
        readStatusMap.set(status.user_id.toString(), status);
      }

      // Create a new array by combining messageDetail and readStatus based on user_id
      const combinedArray = messageDetail.filter(message => {
        const user_id = message.userid.toString();
        return readStatusMap.has(user_id);
      }).map(message => {
        const user_id = message.userid.toString();
        return { ...message, ...readStatusMap.get(user_id) };
      });
      combinedArray.forEach(datas => {
        datas.time = new Date(datas.time)
      })

      combinedArray.sort((a, b) => b.time - a.time)

      console.log(combinedArray);

      res.status(200).json(combinedArray)
    }
  } catch (error) {
    res.status(500).json(error)
  }
}
