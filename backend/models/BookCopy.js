const mongoose = require("mongoose");

const bookCopySchema = new mongoose.Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    copyNumber: { type: Number, required: true }, // 1, 2, 3... per book
    barcode: { type: String, required: true, unique: true, trim: true },
    status: {
      type: String,
      enum: ["available", "issued", "lost", "damaged"],
      default: "available",
    },
    condition: { type: String, default: "Good", trim: true },
  },
  { timestamps: true }
);

bookCopySchema.index({ book: 1, copyNumber: 1 }, { unique: true });

module.exports = mongoose.model("BookCopy", bookCopySchema);
