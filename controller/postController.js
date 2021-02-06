const appError = require("../utils/appError");
// const mongoose = require("mongoose");
const Post = require("../models/postModel");
const catchAsync = require("../utils/catchAsync");

exports.getAllPosts = catchAsync(async (req, res, next) => {
  const posts = await Post.find();
  res.status(200).json({
    status: "success",
    result: posts.length,
    data: {
      posts,
    },
  });
});

exports.createPost = catchAsync(async (req, res, next) => {
  const post = await Post.create({
    title: req.body.title,
    location: req.body.location,
    contact: req.body.contact,
    category: req.body.category,
  });
  res.status(201).json({
    status: "success",
    data: {
      post,
    },
  });
});
exports.getPost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  res.status(200).json({
    status: "success",
    data: {
      post,
    },
  });
});
exports.updatePost = catchAsync(async (req, res, next) => {
  const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true,
  });
  if (!post) return next(new AppError("No document found with that ID", 404));
  res.status(200).json({
    status: "success",
    data: {
      post,
    },
  });
});
