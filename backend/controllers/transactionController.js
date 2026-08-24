const asyncHandler = require("express-async-handler");
const Transaction = require("../models/Transaction");
const Book = require("../models/Book");
const BookCopy = require("../models/BookCopy");
const Member = require("../models/Member");

const FINE_PER_DAY = Number(process.env.FINE_PER_DAY) || 5; // ₹5 per day overdue
const LOAN_DAYS = Number(process.env.LOAN_DAYS) || 14; // default loan period

const POPULATE_FIELDS = [
  { path: "book", select: "title author isbn coverColor" },
  { path: "copy", select: "copyNumber barcode status" },
  { path: "member", select: "name email membershipId" },
];

// @desc    Get all transactions (with populated book, copy & member)
// @route   GET /api/transactions
const getTransactions = asyncHandler(async (req, res) => {
  const { status } = req.query;
  let query = {};
  if (status && status !== "All") query.status = status;

  const transactions = await Transaction.find(query)
    .populate(POPULATE_FIELDS)
    .sort({ createdAt: -1 });

  // Auto-flag overdue
  const now = new Date();
  const updated = transactions.map((t) => {
    if (t.status === "issued" && t.dueDate < now) {
      t.status = "overdue";
    }
    return t;
  });

  res.json(updated);
});

// @desc    Issue a book to a member (assigns a specific available copy)
// @route   POST /api/transactions/issue
const issueBook = asyncHandler(async (req, res) => {
  const { bookId, memberId, loanDays } = req.body;

  if (!bookId || !memberId) {
    res.status(400);
    throw new Error("Please provide bookId and memberId");
  }

  const book = await Book.findById(bookId);
  if (!book) {
    res.status(404);
    throw new Error("Book not found");
  }

  const availableCopy = await BookCopy.findOne({ book: bookId, status: "available" }).sort({ copyNumber: 1 });
  if (!availableCopy) {
    res.status(400);
    throw new Error("No available copies of this book to issue");
  }

  const member = await Member.findById(memberId);
  if (!member) {
    res.status(404);
    throw new Error("Member not found");
  }
  if (member.status === "suspended") {
    res.status(400);
    throw new Error("This member is suspended and cannot borrow books");
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + (loanDays || LOAN_DAYS));

  const transaction = await Transaction.create({
    book: bookId,
    copy: availableCopy._id,
    member: memberId,
    dueDate,
    status: "issued",
  });

  availableCopy.status = "issued";
  await availableCopy.save();

  book.availableCopies = Math.max(0, book.availableCopies - 1);
  await book.save();

  const populated = await transaction.populate(POPULATE_FIELDS);

  res.status(201).json(populated);
});

// @desc    Return a book (frees up its specific copy, or marks it lost/damaged)
// @route   PUT /api/transactions/:id/return
const returnBook = asyncHandler(async (req, res) => {
  const { copyCondition } = req.body; // optional: "lost" | "damaged" — otherwise copy goes back to "available"

  const transaction = await Transaction.findById(req.params.id);
  if (!transaction) {
    res.status(404);
    throw new Error("Transaction not found");
  }
  if (transaction.status === "returned") {
    res.status(400);
    throw new Error("This book has already been returned");
  }

  const returnDate = new Date();
  let fine = 0;
  if (returnDate > transaction.dueDate) {
    const daysLate = Math.ceil((returnDate - transaction.dueDate) / (1000 * 60 * 60 * 24));
    fine = daysLate * FINE_PER_DAY;
  }

  transaction.returnDate = returnDate;
  transaction.status = "returned";
  transaction.fine = fine;
  await transaction.save();

  const book = await Book.findById(transaction.book);
  if (transaction.copy) {
    const copy = await BookCopy.findById(transaction.copy);
    if (copy) {
      copy.status = ["lost", "damaged"].includes(copyCondition) ? copyCondition : "available";
      await copy.save();
    }
  }

  if (book) {
    // Recompute availableCopies from actual copy statuses to stay accurate
    const availableCount = await BookCopy.countDocuments({ book: book._id, status: "available" });
    book.availableCopies = availableCount;
    await book.save();
  }

  const populated = await transaction.populate(POPULATE_FIELDS);

  res.json(populated);
});

// @desc    Get dashboard statistics
// @route   GET /api/transactions/stats/dashboard
const getDashboardStats = asyncHandler(async (req, res) => {
  const totalBooks = await Book.countDocuments();
  const totalMembers = await Member.countDocuments();
  const booksIssued = await Transaction.countDocuments({ status: { $in: ["issued", "overdue"] } });

  const now = new Date();
  const overdueTransactions = await Transaction.find({
    status: { $in: ["issued", "overdue"] },
    dueDate: { $lt: now },
  }).countDocuments();

  const totalCopiesAgg = await Book.aggregate([
    { $group: { _id: null, total: { $sum: "$totalCopies" }, available: { $sum: "$availableCopies" } } },
  ]);

  const finesCollectedAgg = await Transaction.aggregate([
    { $match: { status: "returned", fine: { $gt: 0 } } },
    { $group: { _id: null, total: { $sum: "$fine" } } },
  ]);
  const finesCollected = finesCollectedAgg[0]?.total || 0;

  // Pending fines are computed live for currently overdue loans (not yet returned)
  const overdueOpenLoans = await Transaction.find({
    status: { $in: ["issued", "overdue"] },
    dueDate: { $lt: now },
  });
  const finesPending = overdueOpenLoans.reduce((sum, t) => {
    const daysLate = Math.ceil((now - t.dueDate) / (1000 * 60 * 60 * 24));
    return sum + daysLate * FINE_PER_DAY;
  }, 0);

  const recentTransactions = await Transaction.find()
    .populate("book", "title coverColor")
    .populate("member", "name membershipId")
    .sort({ createdAt: -1 })
    .limit(6);

  res.json({
    totalBooks,
    totalMembers,
    booksIssued,
    overdueCount: overdueTransactions,
    totalCopies: totalCopiesAgg[0]?.total || 0,
    availableCopies: totalCopiesAgg[0]?.available || 0,
    finesCollected,
    finesPending,
    recentTransactions,
  });
});

module.exports = { getTransactions, issueBook, returnBook, getDashboardStats };
