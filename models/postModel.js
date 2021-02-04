const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Post must have a title!"],
    trim: true,
    minlength: [6, "A post must have minimum 6 characters"],
    maxlength: [40, "A post must have maximum 40 characters"],
  },
  location: {
    type: String,
    required: [true, "Post must have a location"],
  },
  category: {
    type: String,
    required: [true, "Post must have a category"],
    enum: {
      values: ["helper", "plumber", "paint", "other"],
      message: "category is either: helper, plumber, paint",
    },
  },
  postedAt: {
    type: Date,
    default: new Date(),
  },
  contact: {
    type: Number,
  },
});

// description, range budget, active

// postSchema.pre("save", function () {
//   this.postedAt = new Date().toISOString();
// });

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
