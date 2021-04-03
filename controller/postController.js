const fs = require("fs");
const multer = require("multer");
const sharp = require("sharp");
const cloudinary = require("cloudinary");
const uuid = require("uuid");
const AppError = require("../utils/appError");
const Post = require("../models/postModel");
const catchAsync = require("../utils/catchAsync");
const ApiFeatures = require("../utils/apiFeatures");

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/posts");
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
  fileFilter: multerFilter
});

exports.uploadPostImages = upload.array("images", 4);

exports.resizeImages = catchAsync(async (req, res, next) => {
  console.log("resizeImages");
  req.body.imagesArray = [];
  if (!req.files) return next();

  // console.log(req.files);
  await Promise.all(
    req.files.map(async image => {
      const filename = uuid.v4() + ".jpeg";
      const myImage = await sharp(image.buffer)
        .resize(1200, 800, {
          fit: "contain"
        })
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`uploads/posts/${filename}`);
      const imgUrl = `uploads/posts/${filename}`;

      req.body.imagesArray.push(imgUrl);
    })
  );
  next();
});

exports.uploadPostImagesToCloud = catchAsync(async (req, res, next) => {
  console.log("uploadPostImagesToCloud");
  if (req.files) {
    req.body.imagesUrl = [];
    await Promise.all(
      req.body.imagesArray.map(async (imgUrl, i) => {
        const response = await cloudinary.uploader.upload(imgUrl, {
          folder: "worker-app/user",
          public_id: `test ${Date.now()}`,
          use_filename: true
        });
        req.body.imagesUrl.push(response.url);
        fs.unlink(imgUrl, () => {});
      })
    );
  }
  next();
});

exports.getAllPosts = catchAsync(async (req, res, next) => {
  // console.log(req.query);

  // Execute query
  const features = new ApiFeatures(Post.find(), req.query, "-postedAt")
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
      posts
    }
  });
});

exports.createPost = catchAsync(async (req, res, next) => {
  // console.log(req.body.imagesArray);
  console.log("createPost");
  console.log(`body: ${req.body}`);

  console.log(req.body.title);
  console.log(req.body.location);
  console.log(req.body.category);

  console.log(`body: ${req.body}`);

  const postData = {
    title: req.body.title,
    location: req.body.location,
    contact: req.body.contact,
    user: req.user._id,
    category: req.body.category
    // images: req.body.imagesUrl ? req.body.imagesUrl : []
  };

  const post = await Post.create(postData);
  console.log(post);
  res.status(201).json({
    status: "success",
    data: {
      post
    }
  });
});
exports.getPost = catchAsync(async (req, res, next) => {
  const query = Post.findById(req.params.id).populate({
    path: "user",
    select: "name email"
  });
  const post = await query;
  res.status(200).json({
    status: "success",
    data: {
      post
    }
  });
});
exports.updatePost = catchAsync(async (req, res, next) => {
  const data = { ...req.body };
  const allowed = ["title", "location", "contact", "category"];
  const filtered = Object.keys(data)
    .filter(key => allowed.includes(key))
    .reduce((obj, key) => {
      obj[key] = data[key];
      return obj;
    }, {});

  // const post = await Post.findByIdAndUpdate(req.params.id, filtered, {
  //   runValidators: true,
  //   new: true
  // });

  let post = await Post.findById(req.params.id);

  if (!post) return next(new AppError("No document found with that ID", 404));

  if (req.user._id + "" !== post.user + "")
    return next(new AppError("This post doesn't belongs to you", 401));

  post = await Post.findByIdAndUpdate(req.params.id, filtered, {
    runValidators: true,
    new: true
  });

  res.status(200).json({
    status: "success",
    data: {
      post
    }
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
      posts
    }
  });
});

exports.addCompletedBy = catchAsync(async (req, res, next) => {
  // check if the post is active
  const post = await Post.findById(req.params.id);
  if (!post.isActive) return next(new AppError("This post is inactive", 400));

  //check if the post belongs to that user
  if (req.user._id + "" !== post.user + "")
    return next(new AppError("This post doesn't belongs to you", 401));
  if (!req.body.completedBy || req.body.completedBy.length <= 0)
    return next(
      new AppError("minimum 1 person required who completed the job", 400)
    );

  // mark the post as inactive and update the completed list
  post.completedBy = req.body.completedBy;
  post.isActive = false;
  const updatedPost = await post.save();

  res.status(200).json({
    status: "success",
    data: {
      updatedPost
    }
  });
});
