const express = require("express");
const cors = require("cors");
const proxy = require("express-http-proxy");
const {
  USER_SERVICE_URL,
  LIBRARY_SERVICE_URL,
  BOOK_SERVICE_URL,
  PORT,
} = require("./config");

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST"],
  })
);
app.use(express.json());

app.use("/user", (req, res, next) => {
  console.log("user route hit the gatewat");
  next();
});
app.use("/user", proxy(USER_SERVICE_URL));
app.use("/library", proxy(LIBRARY_SERVICE_URL));
app.use("/books", proxy(LIBRARY_SERVICE_URL));

app.listen(PORT, () => console.log("Gateway listening at port: ", PORT));
