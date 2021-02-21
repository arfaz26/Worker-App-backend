const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: [true, "Notification must have a message"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Notification must belong to a user"],
  },
  post: {
    type: mongoose.Schema.ObjectId,
    ref: "Post",
    required: [true, "Notification must belong to a post"],
  },
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
