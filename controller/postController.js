const AppError = require("../utils/appError");
// const mongoose = require("mongoose");
const Post = require("../models/postModel");
const catchAsync = require("../utils/catchAsync");
const ApiFeatures = require("../utils/apiFeatures");

exports.getAllPosts = catchAsync(async (req, res, next) => {
  // console.log(req.query);

  // Execute query
  const features = new ApiFeatures(Post.find(), req.query)
    .filter()
    .sort()
    .limitField()
    .pagination();

  const posts = await features.query;
  // const posts = await query;

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
    user: req.user._id,
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
  const q = Post.findById(req.params.id).populate({
    path: "user",
    select: "name email",
  });
  const post = await q;
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

exports.getMyPosts = catchAsync(async (req, res, next) => {
  //1) retrive user id
  const userId = req.user._id;

  // get posts of that user

  const posts = await Post.find({ user: userId });

  res.status(200).json({
    status: "success",
    result: posts.length,
    data: {
      posts,
    },
  });
});
