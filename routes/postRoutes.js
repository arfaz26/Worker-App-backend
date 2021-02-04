const express = require("express");
const postController = require("../controller/postController");

const router = express.Router();

router
  .route("/")
  .get(postController.getAllPosts)
  .post(postController.createPost);

module.exports = router;

router.route("/:id").get(postController.getPost);
// mYrjVDVCjPpd6LAT
