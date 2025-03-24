const Message = require("./models/Message");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
    });

    socket.on("sendMessage", async (data) => {
      const { roomId, senderId, text } = data;

      const message = await Message.create({ room: roomId, sender: senderId, text });

      io.to(roomId).emit("receiveMessage", {
        senderId,
        text,
        createdAt: message.createdAt,
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
