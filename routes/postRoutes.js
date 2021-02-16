const express = require("express");
const postController = require("../controller/postController");
const authController = require("../controller/authController");

const router = express.Router();

router
  .route("/")
  .get(postController.getAllPosts)
  .post(
    authController.protect,
    authController.restrictTo("recruiter"),
    postController.createPost
  );

router
  .route("/getMyPosts")
  .get(authController.protect, postController.getMyPosts);
router
  .route("/:id")
  .get(postController.getPost)
  .patch(postController.updatePost);
// mYrjVDVCjPpd6LAT

module.exports = router;
