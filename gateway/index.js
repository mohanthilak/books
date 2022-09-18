const express = require("express");
const cors = require("cors");
const proxy = require("express-http-proxy");

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
app.use("/user", proxy("http://localhost:4001"));
app.use("/library", proxy("http://localhost:4002"));
app.use("/books", proxy("http://locahost:4002"));

app.listen(4000, () => console.log("Gateway listening at port: ", 4000));
