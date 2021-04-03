const express = require("express");
const authController = require("../controller/authController");
const applicationController = require("../controller/applicationController");

const router = express.Router();

router
  .route("/getMyApplication")
  .get(authController.protect, applicationController.getMyApplications);

router
  .route("/:id")
  .post(
    authController.protect,
    authController.restrictTo("worker"),
    authController.phoneVerificationCheck,
    applicationController.createApplication
  );

router
  .route("/getAllApplications")
  .get(authController.protect, applicationController.getAllApplications);

router
  .route("/:id")
  .get(
    authController.protect,
    applicationController.getCurrentPostApplications
  );

router
  .route("/updateStatus/:id")
  .patch(authController.protect, applicationController.updateApplicationStatus);
module.exports = router;
