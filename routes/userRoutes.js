const express = require("express");
const postController = require("../controller/userController");

const router = express.Router();

router.route("/").get(postController.getAllUsers);

module.exports = router;
