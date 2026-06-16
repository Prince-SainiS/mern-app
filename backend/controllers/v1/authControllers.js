const User = require("../../models/User");
const AppError = require("../../utils/AppError");
const catchAsyncError = require("../../utils/catchAsyncError");
const jwt = require("jsonwebtoken");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../utils/generateToken");

const sendEmail = require("../../utils/emailService");
const crypto = require("crypto");
const cloudinary = require("../../config/cloudinary");

const cookieOptions = {
  httpOnly: true, // Js cannot access cookie
  secure: process.env.NODE_ENV === "production", // HTTPS only in production
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // protects against CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};
const signup = catchAsyncError(async (req, res, next) => {
  const newUser = await User.create(req.body);
  if (!newUser) {
    return next(new AppError("Something went wrong", 400));
  }

  const accessToken = generateAccessToken(newUser._id);
  const refreshToken = generateRefreshToken(newUser._id);

  newUser.refreshToken = refreshToken;
  await newUser.save({ validateBeforeSave: false });
  // validateBeforeSave: false → skips validation
  // because confirmPassword is undefined now
  newUser.password = undefined;

  // send refresh token in httpOnly cookie
  res.cookie("refreshToken", refreshToken, cookieOptions);

  res.status(201).json({
    status: "success",
    accessToken,
    data: {
      newUser,
    },
  });
});

const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. check email and password exist in body
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password +refreshToken");

  if (!user) {
    return next(new AppError("User does not exist", 404));
  }
  const isMatch = await user.comparePasswords(password, user.password);

  if (!isMatch) {
    return next(new AppError("Authentication failed : Wrong Password", 401));
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.cookie("refreshToken", refreshToken, cookieOptions);

  res.status(200).json({
    status: "success",
    accessToken,
    message: "login successfull",
  });
});

// REFRESH TOKEN
const refresh = catchAsyncError(async (req, res, next) => {
  // 1. get refresh token from cookie
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return next(
      new AppError("No refresh token found , please login again", 401),
    );
  }

  // 2. verify refresh token
  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

  // 3. find user and check refresh token matches DB
  const user = await User.findById(decoded.id).select("+refreshToken");

  if (!user || user.refreshToken !== refreshToken) {
    return next(
      new AppError("invalid refresh token , please login again", 401),
    );
  }

  // 4. generate new access token
  const accessToken = generateAccessToken(user._id);

  res.status(200).json({
    status: "success",
    accessToken, // send new access token
  });
});

// LOGOUT
const logout = catchAsyncError(async (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (refreshToken) {
    await User.findOneAndUpdate({ refreshToken }, { refreshToken: null });
  }

  res.clearCookie("refreshToken", cookieOptions);

  res.status(200).json({
    status: "success",
    message: "loggedd out successfully",
  });
});

const forgotPassword = catchAsyncError(async (req, res, next) => {
  console.log(req.body);
  // Step 1 - get user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("No user found with this email", 404));
  }

  // Step 2 - generate reset token
  const resetToken = user.generatePasswordResetToken();
  // resetToken = original token (goes in email)
  // user.passwordRestToken = hashed token (saved in db)
  // user.passwordResetExpires = 10 min from now

  // Step 3 - save user (saves hashed token + expiry in db)
  await user.save({ validateBeforeSave: false });
  // skip validation because we only updating token fields

  // Step 4 - build reset Url
  const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  // req.protocol = "http" or "https"
  // req.get("host") = "localhost:5000"
  // resetToken = original token ✅
  // example: http://localhost:5000/api/user/reset-password/abc123...

  // step 5 - send email

  try {
    await sendEmail({
      to: user.email,
      subject: "Password Reset Request (valid for 10 mins)",
      html: `
        <h2>Forgot your password?</h2>
                <p>Click the link below to reset your password:</p>
                <a href="${resetURL}">Reset Password</a>
                <p>Link expires in 10 minutes.</p>
                <p>If you didn't request this, ignore this email.</p>
      `,
    });

    res.status(200).json({
      status: "success",
      message: "Reset link sent to your email",
    });
  } catch (err) {
    console.log("EMAIL ERROR:", err);
    // if email fails clear token from db
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError("Error sending email, please try again", 500));
  }
});

const resetPassword = catchAsyncError(async (req, res, next) => {
  // step 1 - hash the token from the Url
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  // step 2 - find user by hashedtoken and check expiry
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gte: Date.now() },
  });

  if (!user) {
    return next(new AppError("Token is invalid or expired", 400));
  }

  // step 3 - update password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;

  // step 4  clear the rest tokenfields
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;

  // step 5 save user
  // pre-save hook runs hashes new password
  await user.save();

  // step 6 - generate new token and login user
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.cookie("refreshToken", refreshToken, cookieOptions);

  res.status(200).json({
    status: "success",
    accessToken,
    message: "Password reset successfull",
  });
});

const updatePhoto = catchAsyncError(async (req, res, next) => {
  // STEP 1 - CHECK FILE EXISTS
  if (!req.file) {
    return next(new AppError("Please upload a file", 400));
  }

  // STEP 2 : GET CURRENT USER
  const user = await User.findById(req.user.id);

  // Step 3 : DELETE OLD PHOTO FROM CLOUDINARY(IF NOT DEFAULT)
  if (user.photo && user.photo.includes("user-photos")) {
    const oldPublicId = user.photo.split("/").slice(-2).join("/").split(".")[0];

    await cloudinary.uploader.destroy(oldPublicId);
  }

  // STEP 4 SAVE NEW PHOTO
  user.photo = req.file.path;

  await user.save({ validateBeforeSave: false });

  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    data: {
      photo: user.photo,
    },
  });
});

module.exports = {
  signup,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  updatePhoto,
};
