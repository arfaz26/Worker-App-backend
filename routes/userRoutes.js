const express = require("express");

const authController = require("../controller/authController");
const userController = require("../controller/userController");

const router = express.Router();

router.route("/signIn").post(authController.signIn);
router.route("/signUp").post(authController.signUp);

router.route("/forgotPassword").post(authController.forgotPassword);
router.route("/resetPassword/:token").patch(authController.resetPassword);

router.use(authController.protect);
router.route("/updateMyPassword/").patch(authController.updatePassword);
router.route("/").get(userController.getAllUsers);

router.route("/getMyDetails").get(authController.getMyDetails);
router
  .route("/updateMe")
  .patch(
    authController.demoOne,
    authController.uploadUserPhoto,
    authController.demoTwo,
    authController.updateMe
  );

// router.route("/getAllUser").get(userController.getAllUsers);

module.exports = router;
