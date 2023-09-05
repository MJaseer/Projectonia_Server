import { chatRoomFinder } from '../Helpers/chatHelper.js'

export default function socketConnect(io, activeUsers) {
  let joined = false
  let chatRoomId;
  io.on("connection", (socket) => {
    console.log('socket connected');

    socket.on('activate', async (userId) => {
      const newUserId = userId
      if (!activeUsers[userId]) {
        activeUsers[newUserId] = { user_id: userId, socketId: socket.id };
      }
      if(activeUsers){
        io.emit('active-users',activeUsers)
      }
    })

    socket.on("join", async (userIds) => {
      const newUserId = userIds.sender_id
      chatRoomId = await chatRoomFinder(userIds.sender_id, userIds.receiver_id)

      if (!activeUsers[userIds.sender_id]) {
        activeUsers[newUserId] = { user_id: userIds.sender_id, socketId: socket.id };
      }

      if (chatRoomId) {
        joined = true
        socket.join(chatRoomId)
        console.log('joined');
      }

    });

    socket.on("disconnectUser", (userId) => {
      Object.keys(activeUsers).forEach((key) => {
        console.log(activeUsers);
        if (activeUsers[key].user_id === userId) {
          console.log('deleted');
          delete activeUsers[key];
        }
      });
      console.log(activeUsers,'after');

      io.emit("active-users", activeUsers);
    });

    socket.on("send-message", (data) => {
      if (!joined) {
        socket.join(chatRoomId)
      }
      const { receiver_id } = data;
      const receiver = activeUsers[receiver_id];
      if (receiver) {
        const message = { user: "receiver", message: data.message, time: Date.now() };
        socket.to(receiver.socketId).emit("receive-message", message);
      }
    });
  });
}
