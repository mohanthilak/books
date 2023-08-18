const express = require("express");
const cors = require("cors");
const proxy = require("express-http-proxy");
// const {v4:uuidv4} = require("uuid")
// const {MessageHandling} = require("./Infra/MessageQueue/MessageHandling")

// const  {PublishMessage, createChannel, SubscribeMessage} = require("./Infra/MessageQueue")
const {
  USER_SERVICE_URL,
  LIBRARY_SERVICE_URL,
  PORT,
  NOTIFICATION_SERVICE_URL
} = require("./config");

const app = express();

// let channel;
// const inFlightRequests = new Map();
// (async () => {
//   channel = await createChannel();
//   const MH = new MessageHandling(channel, inFlightRequests)
//   MH.subscribeToEvenets();
// })().catch(err => {
//   console.error(err);
// });


app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST"],
  })
);
app.use(express.json());

app.use("/user", proxy(USER_SERVICE_URL));
app.use("/library", proxy(LIBRARY_SERVICE_URL));
app.use("/book", proxy(LIBRARY_SERVICE_URL));
app.use("/notification", proxy(NOTIFICATION_SERVICE_URL));

app.listen(PORT, () => console.log("Gateway listening at port: ", PORT));


