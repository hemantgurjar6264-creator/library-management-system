const express = require("express");
const router = express.Router();
const {
  getMonthlyReportSummary,
  exportExcelReport,
  exportPdfReport,
} = require("../controllers/reportController");
const { protect } = require("../middleware/authMiddleware");

router.get("/summary", protect, getMonthlyReportSummary);
router.get("/export/excel", protect, exportExcelReport);
router.get("/export/pdf", protect, exportPdfReport);

module.exports = router;
