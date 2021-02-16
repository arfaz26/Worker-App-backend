const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Application = require("../models/applicationModel");
const Post = require("../models/postModel");

exports.createApplication = catchAsync(async (req, res, next) => {
  //   console.log(req.user);

  // check if the post is active
  const post = await Post.findByIdAndUpdate(req.params.id);
  if (!post.isActive) return next(new AppError("Post is not active", 404));

  const application = await Application.create({
    user: req.user._id,
    post: req.params.id,
  });
  res.status(201).json({
    status: "success",
    data: {
      application,
    },
  });
});

exports.getAllApplications = catchAsync(async (req, res, next) => {
  const query = Application.find()
    .populate({
      path: "user",
      select: "name email",
    })
    .populate({
      path: "post",
      select: "_id",
    });
  const applications = await query;

  res.status(200).json({
    status: "success",
    result: applications.length,
    data: {
      applications,
    },
  });
});

exports.getCurrentPostApplications = catchAsync(async (req, res, next) => {
  // 1) retrive the post
  const post = await Post.findById(req.params.id);

  if (post.user + "" !== req.user._id + "")
    return next(new AppError("The post doesn't belongs to you", 401));

  const query = Application.find({ post: req.params.id })
    .sort("appliedAt")
    .populate({
      path: "user",
      select: "name email",
    });
  const applications = await query;
  res.status(200).json({
    status: "success",
    result: applications.length,
    data: {
      applications,
    },
  });
});

exports.getMyApplications = catchAsync(async (req, res, next) => {
  const applications = await Application.find({
    user: req.user._id,
  });
  res.status(200).json({
    status: "success",
    result: applications.length,
    data: {
      applications,
    },
  });
});
