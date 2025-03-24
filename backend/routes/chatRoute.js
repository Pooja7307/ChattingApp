const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
  createRoom,
  getRooms,
  sendMessage,
  getMessages,
} = require("../controllers/chatController");

router.post("/room", authMiddleware, createRoom);
router.get("/room", authMiddleware, getRooms);
router.post("/message", authMiddleware, sendMessage);
router.get("/message/:roomId", authMiddleware, getMessages);
router.delete('/message/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const message = await Message.findById(id);
    if (!message || message.sender.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized or not found" });
    }
    await message.remove();
    io.emit("deleteMessage", { id });
    res.json({ message: "Deleted" });
  });

  router.put('/message/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { text } = req.body;
    const message = await Message.findById(id);
    if (!message || message.sender.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized or not found" });
    }
    message.text = text;
    await message.save();
    io.emit("editMessage", { id, text });
    res.json({ message: "Updated" });
  });
  

module.exports = router;
