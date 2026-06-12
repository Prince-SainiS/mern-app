const User = require("../../models/User");
const AppError = require("../../utils/AppError");
const catchAsyncError = require("../../utils/catchAsyncError");
const ApiFeatures = require("../../utils/ApiFeatures");

// GET ALL USERS
const getAllUsers = catchAsyncError(async (req, res, next) => {
  // step 1 : BUILD QUERY WITH APIFEATURES
  const features = new ApiFeatures(User.find(), req.query)
    .filter() //aply filters
    .sort() //apply sorting
    .limitFields(); // select specific fields

  await features.paginate(); // apply pagination

  // step 2 execute query
  const users = await features.query;

  // step 3 send response

  res.status(200).json({
    status: "success",
    pagination: features.paginationResult,
    results: users.length,
    data: { users },
  });
});

module.exports = { getAllUsers };
