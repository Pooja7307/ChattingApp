const Message = require("../models/Message");
const ChatRoom = require("../models/ChatRoom");

exports.createRoom = async (req, res) => {
  try {
    const { name } = req.body;
    const room = await ChatRoom.create({ name, members: [req.user.id] });
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRooms = async (req, res) => {
  try {
    const rooms = await ChatRoom.find({ members: req.user.id });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { roomId, text } = req.body;
    const message = await Message.create({ sender: req.user.id, room: roomId, text });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ room: roomId }).populate("sender", "username");
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
