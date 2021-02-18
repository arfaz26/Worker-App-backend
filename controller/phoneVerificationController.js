const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const client = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

exports.sendOtp = catchAsync(async (req, res, next) => {
  const verification = await client.verify
    .services(process.env.TWILIO_SERVICE_ID)
    .verifications.create({
      to: "+91" + req.body.phone,
      channel: "sms",
    });

  //   console.log(verification);
  if (verification.status !== "pending")
    return next(new AppError("Something went wrong,try again!", 500));
  res.status(200).json({
    status: "success",
    message: "Verification code sent successfull",
  });
});
exports.verifyOtp = catchAsync(async (req, res, next) => {
  const verification_check = await client.verify
    .services(process.env.TWILIO_SERVICE_ID)
    .verificationChecks.create({
      to: "+91" + req.body.phone,
      code: req.body.code,
    });

  console.log(verification_check.status);

  if (verification_check.status !== "approved")
    return next(new AppError("Verification Failed, try again", 401));
  res.status(200).json({
    data: {
      verification_check,
    },
  });
});
