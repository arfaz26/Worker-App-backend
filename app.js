const express = require("express");
const morgan = require("morgan");
const postRouter = require("./routes/postRoutes");
const userRouter = require("./routes/userRoutes");
const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.use((req, res, next) => {
  console.log("kovuubjnmk");
  req.requesTime = new Date().toISOString();
  next();
});

app.use("/api/v1/posts", postRouter);
app.use("/api/v1/users", userRouter);

module.exports = app;
