// One-time migration: creates BookCopy documents for books that existed before
// per-copy tracking was added. Safe to re-run — it skips books that already
// have copies, and tops up any book whose copy count doesn't match totalCopies.
//
// Usage:  node scripts/backfillCopies.js

const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const connectDB = require("../config/db");
const Book = require("../models/Book");
const BookCopy = require("../models/BookCopy");
const Transaction = require("../models/Transaction");

const run = async () => {
  await connectDB();

  const books = await Book.find();
  let created = 0;

  for (const book of books) {
    const existingCopies = await BookCopy.find({ book: book._id }).sort({ copyNumber: 1 });
    const existingCount = existingCopies.length;

    if (existingCount >= book.totalCopies) continue;

    const toCreate = book.totalCopies - existingCount;

    // Figure out how many copies of this book are currently out on loan,
    // so newly-created copies get the right status.
    const activeLoans = await Transaction.countDocuments({
      book: book._id,
      status: { $in: ["issued", "overdue"] },
    });
    const alreadyIssuedCopies = existingCopies.filter((c) => c.status === "issued").length;
    const remainingIssuedToAssign = Math.max(0, activeLoans - alreadyIssuedCopies);

    const docs = [];
    for (let i = 1; i <= toCreate; i++) {
      const copyNumber = existingCount + i;
      docs.push({
        book: book._id,
        copyNumber,
        barcode: `${book.isbn}-C${copyNumber}`,
        status: i <= remainingIssuedToAssign ? "issued" : "available",
      });
    }
    await BookCopy.insertMany(docs);
    created += docs.length;

    // Keep availableCopies accurate
    const availableCount = await BookCopy.countDocuments({ book: book._id, status: "available" });
    book.availableCopies = availableCount;
    await book.save();

    console.log(`✔ ${book.title}: created ${docs.length} copy record(s)`);
  }

  // Link any open transactions that predate per-copy tracking to an actual copy
  const openLoansWithoutCopy = await Transaction.find({
    status: { $in: ["issued", "overdue"] },
    $or: [{ copy: null }, { copy: { $exists: false } }],
  });

  let linked = 0;
  for (const loan of openLoansWithoutCopy) {
    const freeIssuedCopy = await BookCopy.findOne({
      book: loan.book,
      status: "issued",
      _id: { $nin: await Transaction.find({ copy: { $ne: null } }).distinct("copy") },
    }).sort({ copyNumber: 1 });
    if (freeIssuedCopy) {
      loan.copy = freeIssuedCopy._id;
      await loan.save();
      linked++;
    }
  }

  console.log(`\nDone. ${created} copy record(s) created across ${books.length} title(s). Linked ${linked} legacy transaction(s) to a copy.`);
  process.exit(0);
};

run().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
