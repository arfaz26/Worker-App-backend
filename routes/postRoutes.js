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
    authController.phoneVerificationCheck,
    // postController.uploadPostImages,
    // postController.resizeImages,
    // postController.uploadPostImagesToCloud,
    postController.createPost
  );

// router.route("/createPost").post(
//   authController.protect,
//   // authController.restrictTo("recruiter"),
//   postController.uploadPostImages,
//   postController.resizeImages,
//   postController.uploadPostImagesToCloud,
//   postController.createPost
// );

router
  .route("/getMyPosts")
  .get(authController.protect, postController.getMyPosts);
router
  .route("/:id")
  .get(postController.getPost)

  .patch(
    authController.protect,
    authController.restrictTo("recruiter"),
    postController.updatePost
  );
// mYrjVDVCjPpd6LAT

router
  .route("/updateCompletedStatus/:id")
  .patch(
    authController.protect,
    authController.restrictTo("recruiter"),
    postController.addCompletedBy
  );

module.exports = router;
