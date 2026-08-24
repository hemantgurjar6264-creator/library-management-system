const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    isbn: { type: String, required: true, unique: true, trim: true },
    category: { type: String, default: "General", trim: true },
    publisher: { type: String, trim: true },
    publishedYear: { type: Number },
    totalCopies: { type: Number, required: true, default: 1, min: 1 },
    availableCopies: { type: Number, required: true, default: 1, min: 0 },
    rackLocation: { type: String, trim: true, default: "" },
    coverColor: { type: String, default: "#8a5a2b" },
  },
  { timestamps: true }
);

bookSchema.index({ title: "text", author: "text", isbn: "text" });

module.exports = mongoose.model("Book", bookSchema);
