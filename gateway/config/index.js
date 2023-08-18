const dotenv = require("dotenv");

console.log("NODE_ENV:", process.env.NODE_ENV);

if (process.env.NODE_ENV !== "prod") dotenv.config({ path: "./.dev.env" });
else if (process.env.NODE_ENV !== "docker_dev")
  dotenv.config({ path: "./d.dev.env" });
else dotenv.config({ path: "./.env" });

const PORT = process.env.PORT;
const USER_SERVICE_URL = process.env.USER_SERVICE_URL;
const LIBRARY_SERVICE_URL = process.env.LIBRARY_SERVICE_URL;
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL;
const BOOK_SERVICE_URL = process.env.BOOK_SERVICE_URL;
const MESSAGE_BROKER_URL = process.env.MESSAGE_BROKER_URL;


const LIBRARY_BINDING_KEY = "LIBRARY_BINDING_KEY";
const USER_BINDING_KEY = 'USER_BINDING_KEY';
const COMMON_BINDING_KEY = 'COMMAN_BINDIN_KEY';
const GATEWAY_BINDING_KEY = 'GATEWAY_BINDIN_KEY';
const NOTIFICATION_BINDING_KEY = 'NOTIFICATION';

const QUEUE_NAME = 'GATEWAY_QUEUE';

const COMMON_EXCHANGE = "COMMON_EXCHANGE";
const USER_EXCHANGE = "USER_EXCHANGE";
const LIBRARY_EXCHANGE = "LIBRARY_EXCHANGE";
const NOTIFICATION_EXCHANGE = "NOTIFICATION_EXCHANGE";
const GATEWAY_EXCHANGE = "GATEWAY_EXCHANGE";

module.exports = {
  LIBRARY_BINDING_KEY,
  USER_BINDING_KEY,
  COMMON_BINDING_KEY,
  GATEWAY_BINDING_KEY,
  NOTIFICATION_BINDING_KEY,
  QUEUE_NAME,
  COMMON_EXCHANGE,
  USER_EXCHANGE,
  LIBRARY_EXCHANGE,
  NOTIFICATION_EXCHANGE,
  GATEWAY_EXCHANGE,
  MESSAGE_BROKER_URL,
  PORT,
  USER_SERVICE_URL,
  LIBRARY_SERVICE_URL,
  BOOK_SERVICE_URL,
  NOTIFICATION_SERVICE_URL
};
