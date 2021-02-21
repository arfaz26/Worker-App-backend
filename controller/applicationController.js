const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Application = require("../models/applicationModel");
const Post = require("../models/postModel");
const Notification = require("../models/notificationModel");
// const application = require("../models/applicationModel");

exports.createApplication = catchAsync(async (req, res, next) => {
  // check if the post is active
  const post = await Post.findByIdAndUpdate(req.params.id);
  if (!post.isActive) return next(new AppError("Post is not active", 404));

  // check if user has already applied for the post
  const exsitingCheck = await Application.find({
    $and: [{ post: req.params.id }, { user: req.user._id }],
  });

  if (JSON.stringify(exsitingCheck) !== JSON.stringify([]))
    return next(new AppError("Cannot apply twice"));
  // create application
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

exports.updateApplicationStatus = catchAsync(async (req, res, next) => {
  const applicationId = req.params.id;
  const application = await Application.findById(applicationId);
  const post = await Post.findById(application.post);

  // console.log(post);
  if (post.user + " " !== req.user._id + " ")
    return next(new AppError("post doesn't belongs to you", 401));

  const exsitingCheck = await Notification.find({
    $and: [{ post: post._id }, { user: application.user }],
  });

  if (JSON.stringify(exsitingCheck) !== JSON.stringify([]))
    return next(new AppError("Cannot update status twice"));
  const updatedApplication = await Application.findByIdAndUpdate(
    applicationId,
    {
      status: req.body.changeStatus,
    },
    {
      runValidators: true,
      new: true,
    }
  );
  const subMessage =
    updatedApplication.status === "selected"
      ? "The job poster will contact you soon.."
      : "Apply for other jobs";

  const notification = await Notification.create({
    message: `Your application for ${post.title} at ${post.location} is ${updatedApplication.status}. ${subMessage}`,
    user: application.user,
    post: post._id,
  });
  res.status(200).json({
    status: "success",
    message: "Data updated",
  });
});
