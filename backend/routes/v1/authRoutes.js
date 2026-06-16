const express = require("express");
const {
  signup,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  updatePhoto,
} = require("../../controllers/v1/authControllers");
const protect = require("../../middleware/protect");
const restrictTo = require("../../middleware/restrictTo");
const { authLimiter } = require("../../middleware/rateLimiter");
const validate = require("../../middleware/validate");
const {
  signupValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require("../../validators/authValidators");
const { getAllUsers } = require("../../controllers/v1/userControllers");
const upload = require("../../middleware/upload");

const router = express.Router();

router.post("/register", authLimiter, validate(signupValidator), signup);
router.post("/login", authLimiter, validate(loginValidator), login);
router.post(
  "/forgot-password",
  authLimiter,

  validate(forgotPasswordValidator),

  forgotPassword,
);

router.post("/refresh-token", refresh);
router.post("/logout", logout);
router.post(
  "/reset-password/:token",
  validate(resetPasswordValidator),
  resetPassword,
);

router.patch("/update-photo", protect, upload.single("photo"), updatePhoto);

router.get("/", protect, restrictTo("admin"), getAllUsers);

router.get("/me", protect, (req, res) => {
  res.status(200).json({
    status: "success",
    data: { user: req.user },
  });
});

module.exports = router;
