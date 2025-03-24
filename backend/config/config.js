
require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 8081,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  FRONTEND_URL: process.env.FRONTEND_URL || "*", 
};