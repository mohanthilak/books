const dotenv = require("dotenv");

console.log("NODE_ENV:", process.env.NODE_ENV);

if (process.env.NODE_ENV !== "prod") dotenv.config({ path: "./.dev.env" });
else if (process.env.NODE_ENV !== "docker_dev")
  dotenv.config({ path: "./d.dev.env" });
else dotenv.config({ path: "./.env" });

const PORT = process.env.PORT;
const USER_SERVICE_URL = process.env.USER_SERVICE_URL;
const LIBRARY_SERVICE_URL = process.env.LIBRARY_SERVICE_URL;
const BOOK_SERVICE_URL = process.env.BOOK_SERVICE_URL;

module.exports = {
  PORT,
  USER_SERVICE_URL,
  LIBRARY_SERVICE_URL,
  BOOK_SERVICE_URL,
};
