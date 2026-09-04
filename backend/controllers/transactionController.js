const asyncHandler = require("express-async-handler");
const Transaction = require("../models/Transaction");
const Book = require("../models/Book");
const BookCopy = require("../models/BookCopy");
const Member = require("../models/Member");
const { getSettingsDoc } = require("./settingsController");
const { logActivity } = require("./activityController");


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
  const settings = await getSettingsDoc();

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
  dueDate.setDate(dueDate.getDate() + (loanDays || settings.loanDuration || 14));

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

  await logActivity("Issue Book", `Issued book to ${member.name} (Transaction: ${transaction._id})`, req.user?._id);

  res.status(201).json(populated);
});

// @desc    Return a book (frees up its specific copy, or marks it lost/damaged)
// @route   PUT /api/transactions/:id/return
const returnBook = asyncHandler(async (req, res) => {
  const { copyCondition } = req.body; // optional: "lost" | "damaged" — otherwise copy goes back to "available"
  const settings = await getSettingsDoc();

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
    fine = daysLate * (settings.finePerDay || 5);
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
  
  await logActivity("Return Book", `Returned book for transaction ${transaction._id}`, req.user?._id);

  res.json(populated);
});

// @desc    Get dashboard statistics
// @route   GET /api/transactions/stats/dashboard
const getDashboardStats = asyncHandler(async (req, res) => {
  const settings = await getSettingsDoc();
  const totalBooks = await Book.countDocuments({ isArchived: { $ne: true } });
  const totalMembers = await Member.countDocuments({ status: { $ne: "inactive" } });
  const booksIssued = await Transaction.countDocuments({ status: { $in: ["issued", "overdue"] } });

  const now = new Date();
  const overdueTransactions = await Transaction.find({
    status: { $in: ["issued", "overdue"] },
    dueDate: { $lt: now },
  }).countDocuments();

  const totalCopiesAgg = await Book.aggregate([
    { $match: { isArchived: { $ne: true } } },
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
    return sum + daysLate * (settings.finePerDay || 5);
  }, 0);

  const recentTransactions = await Transaction.find()
    .populate("book", "title coverColor")
    .populate("member", "name membershipId")
    .sort({ createdAt: -1 })
    .limit(6);

  // Generate trend data for the last 6 months
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push({
      month: d.toLocaleString("default", { month: "short" }),
      year: d.getFullYear(),
      start: new Date(d.getFullYear(), d.getMonth(), 1),
      end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
    });
  }

  const trendData = await Promise.all(
    months.map(async ({ month, start, end }) => {
      const issued = await Transaction.countDocuments({
        createdAt: { $gte: start, $lte: end }
      });
      const returned = await Transaction.countDocuments({
        status: "returned",
        updatedAt: { $gte: start, $lte: end }
      });
      return { name: month, issued, returned };
    })
  );

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
    trendData, // Added for frontend recharts
  });
});

// @desc    Get Overdue Books specifically
// @route   GET /api/transactions/overdue
const getOverdueBooks = asyncHandler(async (req, res) => {
  const now = new Date();
  const settings = await getSettingsDoc();
  
  const overdueTransactions = await Transaction.find({
    status: { $in: ["issued", "overdue"] },
    dueDate: { $lt: now },
  })
    .populate(POPULATE_FIELDS)
    .sort({ dueDate: 1 });
    
  // Calculate dynamic fine
  const results = overdueTransactions.map(t => {
    const daysLate = Math.ceil((now - t.dueDate) / (1000 * 60 * 60 * 24));
    t.fine = daysLate * (settings.finePerDay || 5);
    t.status = "overdue";
    return t;
  });
  
  res.json(results);
});

module.exports = { getTransactions, issueBook, returnBook, getDashboardStats, getOverdueBooks };
