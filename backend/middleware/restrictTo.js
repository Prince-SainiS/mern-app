const AppError = require("../utils/AppError");
const catchAsyncError = require("../utils/catchAsyncError");

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You are not authorised to access this route", 403),
      );
    }
    next();
  };

};

module.exports = restrictTo;
