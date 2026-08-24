const asyncHandler = require("express-async-handler");
const Book = require("../models/Book");
const BookCopy = require("../models/BookCopy");
const Transaction = require("../models/Transaction");

// Helper: create N BookCopy documents for a book, starting after the highest existing copyNumber
const createCopiesForBook = async (book, count, startFrom = 0) => {
  const docs = [];
  for (let i = 1; i <= count; i++) {
    const copyNumber = startFrom + i;
    docs.push({
      book: book._id,
      copyNumber,
      barcode: `${book.isbn}-C${copyNumber}`,
      status: "available",
    });
  }
  if (docs.length) await BookCopy.insertMany(docs);
};

// Recompute totalCopies/availableCopies on the Book from its BookCopy documents
const syncBookCounts = async (bookId) => {
  const copies = await BookCopy.find({ book: bookId });
  const totalCopies = copies.length;
  const availableCopies = copies.filter((c) => c.status === "available").length;
  await Book.findByIdAndUpdate(bookId, { totalCopies, availableCopies });
  return { totalCopies, availableCopies };
};

// @desc    Get all books (supports search & genre/author/availability filters)
// @route   GET /api/books
const getBooks = asyncHandler(async (req, res) => {
  const { search, category, author, availability } = req.query;
  let query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { author: { $regex: search, $options: "i" } },
      { isbn: { $regex: search, $options: "i" } },
    ];
  }

  if (category && category !== "All") {
    query.category = category;
  }

  if (author && author !== "All") {
    query.author = author;
  }

  if (availability === "available") {
    query.availableCopies = { $gt: 0 };
  } else if (availability === "unavailable") {
    query.availableCopies = { $lte: 0 };
  }

  const books = await Book.find(query).sort({ createdAt: -1 });
  res.json(books);
});

// @desc    Get single book
// @route   GET /api/books/:id
const getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    res.status(404);
    throw new Error("Book not found");
  }
  res.json(book);
});

// @desc    Create a book (auto-generates individually tracked copies)
// @route   POST /api/books
const createBook = asyncHandler(async (req, res) => {
  const { title, author, isbn, category, publisher, publishedYear, totalCopies, rackLocation, coverColor } = req.body;

  if (!title || !author || !isbn || !totalCopies) {
    res.status(400);
    throw new Error("Please provide title, author, isbn and totalCopies");
  }

  const book = await Book.create({
    title,
    author,
    isbn,
    category,
    publisher,
    publishedYear,
    totalCopies,
    availableCopies: totalCopies,
    rackLocation,
    coverColor,
  });

  await createCopiesForBook(book, Number(totalCopies), 0);

  res.status(201).json(book);
});

// @desc    Update a book (adjusts individual copies if totalCopies changes)
// @route   PUT /api/books/:id
const updateBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    res.status(404);
    throw new Error("Book not found");
  }

  const prevTotal = book.totalCopies;
  const { totalCopies, ...rest } = req.body;
  Object.assign(book, rest);

  if (totalCopies !== undefined && Number(totalCopies) !== prevTotal) {
    const newTotal = Number(totalCopies);
    if (newTotal > prevTotal) {
      // Add new copies
      await createCopiesForBook(book, newTotal - prevTotal, prevTotal);
    } else {
      // Remove copies, but only ones currently available (never remove issued copies)
      const toRemove = prevTotal - newTotal;
      const removableCopies = await BookCopy.find({ book: book._id, status: "available" })
        .sort({ copyNumber: -1 })
        .limit(toRemove);
      if (removableCopies.length < toRemove) {
        res.status(400);
        throw new Error(
          `Cannot reduce to ${newTotal} copies — ${prevTotal - removableCopies.length} are currently issued.`
        );
      }
      await BookCopy.deleteMany({ _id: { $in: removableCopies.map((c) => c._id) } });
    }
  }

  await book.save();
  await syncBookCounts(book._id);
  const updated = await Book.findById(book._id);
  res.json(updated);
});

// @desc    Delete a book (and its copies)
// @route   DELETE /api/books/:id
const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    res.status(404);
    throw new Error("Book not found");
  }

  const issuedCopy = await BookCopy.findOne({ book: book._id, status: "issued" });
  if (issuedCopy) {
    res.status(400);
    throw new Error("Cannot remove this title — one or more copies are currently issued");
  }

  await BookCopy.deleteMany({ book: book._id });
  await book.deleteOne();
  res.json({ message: "Book removed successfully" });
});

// @desc    Get distinct categories (genres)
// @route   GET /api/books/meta/categories
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Book.distinct("category");
  res.json(categories.filter(Boolean).sort());
});

// @desc    Get distinct authors
// @route   GET /api/books/meta/authors
const getAuthors = asyncHandler(async (req, res) => {
  const authors = await Book.distinct("author");
  res.json(authors.filter(Boolean).sort());
});

// @desc    Get all copies of a book, with who currently holds any issued copy
// @route   GET /api/books/:id/copies
const getBookCopies = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    res.status(404);
    throw new Error("Book not found");
  }

  const copies = await BookCopy.find({ book: book._id }).sort({ copyNumber: 1 });

  const issuedCopyIds = copies.filter((c) => c.status === "issued").map((c) => c._id);
  const activeTransactions = await Transaction.find({
    copy: { $in: issuedCopyIds },
    status: { $in: ["issued", "overdue"] },
  }).populate("member", "name membershipId");

  const txByCopy = {};
  activeTransactions.forEach((t) => {
    txByCopy[t.copy?.toString()] = t;
  });

  const result = copies.map((c) => ({
    _id: c._id,
    copyNumber: c.copyNumber,
    barcode: c.barcode,
    status: c.status,
    condition: c.condition,
    heldBy: txByCopy[c._id.toString()]
      ? {
          member: txByCopy[c._id.toString()].member,
          dueDate: txByCopy[c._id.toString()].dueDate,
          transactionId: txByCopy[c._id.toString()]._id,
        }
      : null,
  }));

  res.json(result);
});

// @desc    Update a single copy's status (e.g. mark lost/damaged, or back to available)
// @route   PUT /api/books/:id/copies/:copyId
const updateCopyStatus = asyncHandler(async (req, res) => {
  const { status, condition } = req.body;
  const validStatuses = ["available", "lost", "damaged"]; // "issued" is only ever set via the issue flow

  if (status && !validStatuses.includes(status)) {
    res.status(400);
    throw new Error("Invalid status. Use available, lost, or damaged.");
  }

  const copy = await BookCopy.findOne({ _id: req.params.copyId, book: req.params.id });
  if (!copy) {
    res.status(404);
    throw new Error("Copy not found");
  }
  if (copy.status === "issued") {
    res.status(400);
    throw new Error("This copy is currently issued. Return it first before changing its status.");
  }

  if (status) copy.status = status;
  if (condition) copy.condition = condition;
  await copy.save();
  await syncBookCounts(req.params.id);

  res.json(copy);
});

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getCategories,
  getAuthors,
  getBookCopies,
  updateCopyStatus,
  syncBookCounts,
};
