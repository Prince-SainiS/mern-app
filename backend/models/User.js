const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Usrname is required"],
      trim: true,
      minlength: [3, "Username should be at least 3 characters"],
      maxlength: [30, "Username should not exceed 30 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Enter vaild email address"],
    },
    password: {
      type: String,
      required: true,
      minlength: [8, "Password should be atleast 8 characters"],
      select: false,
    },
    confirmPassword: {
      type: String,
      required: true,
      minlength: [8, "Password should be atleast 8 characters"],
      // select : false
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    photo: {
      type: String,
      default: "https://res.cloudinary.com/.../default-avatar.png"
    },
    refreshToken: {
      type: String,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  if (this.password !== this.confirmPassword) {
    throw new Error("Passwords are different");
  }

  this.password = await bcrypt.hash(this.password, 10);
  this.confirmPassword = undefined;
});

userSchema.methods.comparePasswords = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};
userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256") //hashing algorithm
    .update(resetToken) //what to hash
    .digest("hex");  // output format

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

console.log(userSchema.methods);

const User = mongoose.model("User", userSchema);

module.exports = User;
