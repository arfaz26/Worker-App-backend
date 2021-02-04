// const AppError = require("../utils/appError");

// const sendErrorProd = (err, res) => {
//   console.log("in err prod");

//   // Operational, trusted error: send message to client
//   if (err.isOperational) {
//     res.status(err.statusCode).json({
//       status: err.status,
//       message: err.message,
//     });

//     // Programming or other unknown error: don't leak error details
//   } else {
//     // 1) Log error
//     console.error("ERROR 💥", err);
//     // err);

//     // 2) Send generic message
//     res.status(500).json({
//       // err,
//       status: "error",
//       message: "Something went very wrong!",
//     });
//   }
// };

// const sendErrorDev = (err, res) => {
//   //   console.log(err);
//   console.log("in err dev");
//   res.status(err.statusCode).json({
//     status: err.status,
//     message: err.message,
//     error: err.name,
//     stack: err.stack,
//   });
// };

// const handleCastErrorDB = (err) => {
//   const message = `Invalid ${err.path}: ${err.value}.`;
//   return new AppError(message, 400);
// };

// const handleDuplicateFieldsDB = (err) => {
//   const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
//   console.log(value);

//   const message = `Duplicate field value: ${value}. Please use another value!`;
//   return new AppError(message, 400);
// };

// const handleValidationErrorDB = (err) => {
//   const errors = Object.values(err.errors).map((el) => el.message);

//   const message = `Invalid input data. ${errors.join(". ")}`;
//   return new AppError(message, 400);
// };

// module.exports = (err, req, res, next) => {
//   console.log(err);

//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || "error";

//   if (process.env.NODE_ENV === "development") {
//     // console.log(err);

//     sendErrorDev(err, res);
//   } else if (process.env.NODE_ENV === "production") {
//     let error = { ...err };
//     console.log(err[0]);
//     // let error = { ...err };

//     if (error.name === "CastError") error = handleCastErrorDB(error);
//     if (error.code === 11000) error = handleDuplicateFieldsDB(error);
//     if (error.name === "ValidationError")
//       error = handleValidationErrorDB(error);
//     // console.log(JSON.parse(err));
//     // if (errors.cateorgy.name === "ValidationError") {
//     //   error = handleValidationErrorDB(error);
//     // }
//     // console.log(error);
//     sendErrorProd(error, res);
//   }
// };

const AppError = require("../utils/appError");

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path === "_id" ? "id" : err.path}: ${
    err.value
  }.`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    name: err.name,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error("ERROR 💥", err);

    // 2) Send generic message
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    if (err.name === "ValidationError") error = handleValidationErrorDB(error);
    if (err.name === "CastError") error = handleCastErrorDB(error);

    sendErrorProd(error, res);
  }
};
