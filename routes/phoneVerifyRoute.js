const express = require("express");
const authController = require("../controller/authController");
const phoneVerificationController = require("../controller/phoneVerificationController");

const router = express.Router();

router
  .route("/sendOtp")
  .post(authController.protect, phoneVerificationController.sendOtp);

router
  .route("/verifyOtp")
  .post(authController.protect, phoneVerificationController.verifyOtp);

module.exports = router;
