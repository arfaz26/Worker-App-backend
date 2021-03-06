const express = require("express");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const morgan = require("morgan");
const cloudinary = require("cloudinary");
const postRouter = require("./routes/postRoutes");
const userRouter = require("./routes/userRoutes");
const applicationRouter = require("./routes/applicationRoutes");
const phoneVerifyRouter = require("./routes/phoneVerifyRoute");
const notificationRouter = require("./routes/notificationRoutes");
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

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

app.use("/api/v1/posts", postRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/apply", applicationRouter);
app.use("/api/v1/verifyPhone", phoneVerifyRouter);
app.use("/api/v1/notifications", notificationRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find new ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
