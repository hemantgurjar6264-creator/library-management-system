const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @desc    Register a new admin/librarian user
// @route   POST /api/auth/register
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please fill all required fields");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User with this email already exists");
  }

  const user = await User.create({ name, email, password, role: role || "librarian" });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  });
});

// @desc    Login user (accepts either name or email in the "identifier" field)
// @route   POST /api/auth/login
const loginUser = asyncHandler(async (req, res) => {
  const { email, identifier, password } = req.body;
  const loginValue = identifier || email; // "identifier" is the new field; "email" kept for backward compatibility

  if (!loginValue || !password) {
    res.status(400);
    throw new Error("Please provide your name/email and password");
  }

  const user = await User.findOne({
    $or: [{ email: loginValue.toLowerCase().trim() }, { name: new RegExp(`^${escapeRegex(loginValue.trim())}$`, "i") }],
  });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid name/email or password");
  }
});

// @desc    Get current logged-in user
// @route   GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});

// @desc    Request a password reset email
// @route   POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400);
    throw new Error("Please provide your email address");
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  // Always respond the same way whether or not the email exists,
  // so the form can't be used to check which emails are registered.
  const genericResponse = {
    message: "If an account exists for that email, a password reset link has been sent.",
  };

  if (!user) {
    return res.json(genericResponse);
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
      <h2 style="color: #112240;">Reset your Library System password</h2>
      <p>You requested a password reset. Click the button below to choose a new password. This link expires in 30 minutes.</p>
      <p style="margin: 24px 0;">
        <a href="${resetUrl}" style="background:#ff6b00;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Reset Password</a>
      </p>
      <p>If you didn't request this, you can safely ignore this email.</p>
      <p style="color:#94a3b8;font-size:12px;">Or copy this link: ${resetUrl}</p>
    </div>
  `;

  try {
    await sendEmail({ to: user.email, subject: "Reset your Library System password", html });
    res.json(genericResponse);
  } catch (err) {
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save({ validateBeforeSave: false });
    res.status(500);
    throw new Error("Could not send the reset email. Please try again later.");
  }
});

// @desc    Reset password using the token emailed to the user
// @route   PUT /api/auth/reset-password/:token
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters");
  }

  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("This reset link is invalid or has expired. Please request a new one.");
  }

  user.password = password;
  user.resetPasswordToken = null;
  user.resetPasswordExpire = null;
  await user.save();

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  });
});

module.exports = { registerUser, loginUser, getMe, forgotPassword, resetPassword };
