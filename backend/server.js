const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { Server } = require("socket.io");

dotenv.config();

const connectDB = require("./config/db");
const config = require("./config/config");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on("connected", () => {
  console.log("MongoDB connected");
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));

require("./socket")(io);

const PORT = process.env.PORT || 8081;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
