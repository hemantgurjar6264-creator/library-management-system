const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: [true, "Book title is required"], 
      trim: true,
      validate: {
        validator: function(v) { return v.trim().length > 0; },
        message: "Title cannot be just empty spaces"
      }
    },
    author: { 
      type: String, 
      required: [true, "Author name is required"], 
      trim: true,
      validate: {
        validator: function(v) { return v.trim().length > 0; },
        message: "Author cannot be just empty spaces"
      }
    },
    isbn: { 
      type: String, 
      required: [true, "ISBN is required"], 
      unique: true, 
      trim: true,
      minlength: [10, "ISBN must be at least 10 characters long"]
    },
    category: { type: String, default: "General", trim: true },
    publisher: { type: String, trim: true },
    publishedYear: { 
      type: Number,
      min: [1000, "Published year must be a valid year"],
      max: [new Date().getFullYear(), "Published year cannot be in the future"]
    },
    totalCopies: { type: Number, required: [true, "Total copies is required"], default: 1, min: [1, "Total copies must be at least 1"] },
    availableCopies: { type: Number, required: true, default: 1, min: [0, "Available copies cannot be negative"] },
    rackLocation: { type: String, trim: true, default: "" },
    coverColor: { type: String, default: "#8a5a2b" },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

bookSchema.index({ title: "text", author: "text", isbn: "text" });

module.exports = mongoose.model("Book", bookSchema);
