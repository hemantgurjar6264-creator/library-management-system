const express = require("express");
const router = express.Router();
const {
  getTransactions,
  issueBook,
  returnBook,
  getDashboardStats,
} = require("../controllers/transactionController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getTransactions);
router.post("/issue", protect, issueBook);
router.put("/:id/return", protect, returnBook);
router.get("/stats/dashboard", protect, getDashboardStats);

module.exports = router;
