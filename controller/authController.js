const fs = require("fs");
const { promisify } = require("util");
const crypto = require("crypto");
const cloudinary = require("cloudinary").v2;
const jwt = require("jsonwebtoken");

const DatauriParser = require("datauri/parser");
const parser = new DatauriParser();
// const Datauri = require("datauri");
// const streamifier = require("streamifier");
const multer = require("multer");
const User = require("../models/userModel");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");

// const datauri = new Datauri();
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/user");
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split("/")[1];
//     cb(null, `user-${req.user._id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! please upload only image", 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.demoOne = (req, res, next) => {
  console.log("in demo 1");
  next();
};

exports.uploadUserPhoto = upload.single("avatar");

exports.demoTwo = (req, res, next) => {
  console.log("in demo 2");
  next();
};

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.getMyDetails = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.signIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  req.user = user;

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  console.log(req.user);
  res.status(200).json({
    status: "success",
    token: signToken(user._id),
  });
});

exports.signUp = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    role: req.body.role,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  (user.password = undefined),
    res.status(201).json({
      status: "success",
      data: {
        user,
        token: signToken(user._id),
      },
    });
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

exports.phoneVerificationCheck = catchAsync(async (req, res, next) => {
  if (!req.user.isPhoneVerified)
    return next(new AppError("Please verify your phone number", 404));
  next();
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) getting token if its there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }
  // console.log(token);
  // 2) verify the token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) check if user still exists
  // console.log(decoded.id);
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }
  // 4) check if user changed the password after token was issued

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }
  // console.log("------------");
  //
  // console.log(currentUser);
  // 5) grant access
  req.user = currentUser;
  // console.log("------------");
  // console.log(req.user);
  // console.log("------------");

  next();
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) get email from post
  const user = await User.findOne({ email: req.body.email });
  // console.log(user);
  if (!user) return next(new AppError("There is no user with that email", 404));

  // 2) generate random token
  const resetToken = user.createPasswordResetToken();
  const resetUser = await user.save({ validateBeforeSave: false });

  // 3) send email
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password?? here is your reset url ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Your reset password link valid for 10 mins`,
      message,
    });

    res.status(200).json({
      status: "success",
      message: "email sent successfully",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    console.log(err);
    return next(new AppError("Error sending email try again later", 500));
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) get the user based on the token

  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  // if()

  // 2) If token has not expired, and there is user, set the new password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;

  await user.save();

  user.password = undefined;
  res.status(200).json({
    status: "success",
    data: {
      token: signToken(user._id),
      user,
    },
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) get the user from the collection
  const user = await User.findById(req.user.id).select("+password");

  // 2) check if posted currentpassword is same as user password
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError("Password is incorrect", 401));
  }

  // 3) update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  await user.save();
  user.password = undefined;

  // log user in send jwt
  res.status(200).json({
    status: "success",
    data: {
      token: signToken(user._id),
      user,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  let response;
  console.log("in updateMe");
  // if (req.file) {
  try {
    // console.log(req.file);
    parser.format(".jpeg", req.file.buffer);
    // console.log("content: ", parser.content);
    response = await cloudinary.uploader.upload("uploads/user/test.jpeg", {
      folder: "worker-app/user",
      public_id: `test ${Date.now()}`,
      use_filename: true,
    });
  } catch (err) {
    // throw err;
    console.log(err);
  }
  // }

  // const patch = {
  //   photoUrl: req.file ? response.url : req.user.photoUrl,
  //   name: req.body.name ? req.body.name : req.user.name,
  // };
  // const updatedUser = await User.findByIdAndUpdate(req.user._id, patch, {
  //   new: true,
  // });

  res.status(200).json({
    status: "success",
    data: {
      response,
      // updatedUser,
      // data: parser.content,
    },
  });
});
