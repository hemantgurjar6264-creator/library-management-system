const express = require("express");
const router = express.Router();
const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getCategories,
  getAuthors,
  getBookCopies,
  updateCopyStatus,
} = require("../controllers/bookController");
const { protect } = require("../middleware/authMiddleware");

router.get("/meta/categories", protect, getCategories);
router.get("/meta/authors", protect, getAuthors);
router.route("/").get(protect, getBooks).post(protect, createBook);
router
  .route("/:id")
  .get(protect, getBookById)
  .put(protect, updateBook)
  .delete(protect, deleteBook);
router.get("/:id/copies", protect, getBookCopies);
router.put("/:id/copies/:copyId", protect, updateCopyStatus);

module.exports = router;
