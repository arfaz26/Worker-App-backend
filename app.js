const express = require("express");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const morgan = require("morgan");
const postRouter = require("./routes/postRoutes");
const userRouter = require("./routes/userRoutes");
const applicationRouter = require("./routes/applicationRoutes");
const globalErrorHandler = require("./controller/errorController");
const AppError = require("./utils/appError");

const app = express();

app.use(express.json());
app.use(helmet());
app.use(mongoSanitize());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use((req, res, next) => {
  req.requesTime = new Date().toISOString();
  next();
});

app.use("/api/v1/posts", postRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/apply", applicationRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
