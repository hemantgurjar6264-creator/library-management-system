const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    libraryName: { type: String, default: "Library Management System" },
    loanDuration: { type: Number, default: 14 },
    finePerDay: { type: Number, default: 5 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
