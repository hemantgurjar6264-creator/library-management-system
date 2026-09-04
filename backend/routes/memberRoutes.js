const express = require("express");
const router = express.Router();
const {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  bulkUploadMembers,
} = require("../controllers/memberController");
const { protect } = require("../middleware/authMiddleware");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.post("/bulk-upload", protect, upload.single("file"), bulkUploadMembers);

router.route("/").get(protect, getMembers).post(protect, createMember);
router
  .route("/:id")
  .get(protect, getMemberById)
  .put(protect, updateMember)
  .delete(protect, deleteMember);

module.exports = router;
