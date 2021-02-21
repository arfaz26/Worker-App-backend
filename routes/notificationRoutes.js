const express = require("express");
const notificationController = require("../controller/notificationController");
const authController = require("../controller/authController");
const router = express.Router();

router
  .route("/")
  .get(authController.protect, notificationController.getMyNotifications);

module.exports = router;
