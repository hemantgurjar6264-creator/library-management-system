const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, "Name is required"], 
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      validate: {
        validator: function(v) { return v.trim().length > 0; },
        message: "Name cannot be just empty spaces"
      }
    },
    email: { 
      type: String, 
      required: [true, "Email is required"], 
      unique: true, 
      lowercase: true, 
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email address"]
    },
    phone: { 
      type: String, 
      required: [true, "Phone number is required"], 
      trim: true,
      match: [/^[0-9+\-\s()]{7,15}$/, "Please provide a valid phone number (7-15 digits, + and - allowed)"]
    },
    address: { type: String, trim: true, default: "" },
    membershipId: { type: String, required: [true, "Membership ID is required"], unique: true },
    status: { type: String, enum: ["active", "suspended", "inactive"], default: "active" },
    joinedDate: { type: Date, default: Date.now },
    department: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Member", memberSchema);
