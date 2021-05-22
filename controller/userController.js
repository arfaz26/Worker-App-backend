const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: "success",
    result: users.length,
    data: {
      users
    }
  });
});

exports.getDetail = catchAsync(async (req, res, next) => {
  const user = await User.find(
    {
      _id: req.params.id
    },
    "-passwordChangedAt"
  );
  res.status(200).json({
    user
  });
});
