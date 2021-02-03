// const mongoose = require("mongoose");
const Post = require("../models/postModel");

exports.getAllPosts = async (req, res, next) => {
  try {
    const posts = await Post.find();
    res.status(200).json({
      status: "success",
      result: posts.length,
      data: {
        posts,
      },
    });
    next();
  } catch (error) {
    console.log(error);
  }
};
