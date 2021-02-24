const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Post must have a title!"],
    trim: true,
    minlength: [6, "A post must have minimum 6 characters"],
    maxlength: [40, "A post must have maximum 40 characters"]
  },
  location: {
    type: String,
    required: [true, "Post must have a location"]
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Post must belong to a user"]
  },
  completedBy: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User"
    }
  ],
  images: [String],
  category: {
    type: String,
    required: [true, "Post must have a category"],
    enum: {
      values: ["helper", "plumber", "paint", "other"],
      message: "category is either: helper, plumber, paint,other"
    }
  },
  postedAt: {
    type: Date,
    default: new Date()
  },
  __v: {
    type: Number,
    select: false
  },
  contact: {
    type: Number
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// description, range budget, active

// postSchema.pre("save", function () {
//   this.postedAt = new Date().toISOString();
// });

// postSchema.post(/^find/, function (next) {
//   this.populate({ select: "-__v" });
// });

// postSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: "user",
//     select: "name email",
//   });
//   next();
// });

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
