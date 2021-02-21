const catchAsync = require("../utils/catchAsync");
const Notification = require("../models/notificationModel");

exports.getMyNotifications = catchAsync(async (req, res, next) => {
  const notifications = await Notification.find({
    user: req.user._id,
  });
  res.status(200).json({
    status: "success",
    notifications,
  });
});
