const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  server_host: process.env.SERVER_HOST,
  port: process.env.PORT,
  frontend_host: process.env.FRONTEND_HOST,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  jwt_secret: process.env.JWT_SECRET,
};
