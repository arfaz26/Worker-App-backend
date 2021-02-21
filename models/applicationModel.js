const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.ObjectId,
    ref: "Post",
    required: [true, "application must belong to a post"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "application must belong to a user"],
  },
  appliedAt: {
    type: Date,
    default: Date(),
  },
  status: {
    type: String,
    required: true,
    enum: ["applied", "selected", "not selected"],
    default: "applied",
  },
});

const application = mongoose.model("Application", applicationSchema);
module.exports = application;
