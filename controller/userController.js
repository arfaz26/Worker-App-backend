exports.getAllUsers = (req, res, next) => {
  res.status(200).json({
    status: "success",
    data: "hello from server, here are all your Users",
  });
  next();
};
