const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const catchAsyncError = require("../utils/catchAsyncError");

const protect = catchAsyncError(async (req, res, next) => {
  // check token exist
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("You are not logged in", 401));
  }

  // verify token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new AppError("Access token expired", 401));
      //                        👆 frontend checks this message
    }
    return next(new AppError("Invalid token", 401));
  }
  // check user still exist

  const curUser = await User.findById(decoded.id);
  if (!curUser) {
    return next(new AppError("User no longer exists", 401));
  }

  req.user = curUser;

  next();
});

module.exports = protect;
