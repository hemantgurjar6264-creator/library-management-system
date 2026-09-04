const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const { loginUser, getMe, forgotPassword, resetPassword } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: "Too many login attempts from this IP, please try again after 15 minutes",
});

router.post("/login", authLimiter, loginUser);
router.get("/me", protect, getMe);
router.post("/forgot-password", authLimiter, forgotPassword);
router.put("/reset-password/:token", resetPassword);

module.exports = router;
