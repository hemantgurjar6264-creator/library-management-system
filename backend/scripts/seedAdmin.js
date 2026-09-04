const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const User = require("../models/User");

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to database...");

    const email = "admin@example.com";
    
    let admin = await User.findOne({ email });
    if (admin) {
      console.log("Admin already exists!");
      process.exit(0);
    }

    // Avoid hardcoding passwords in source code.
    // Use environment variable. If not provided, generate a random one and DO NOT log it.
    const crypto = require("crypto");
    const defaultPassword = process.env.ADMIN_PASSWORD || crypto.randomBytes(16).toString("hex");

    await User.create({
      name: "System Admin",
      email: email,
      password: defaultPassword,
      role: "admin",
    });

    console.log("✅ Admin user seeded successfully!");
    console.log(`Email: ${email}`);
    
    if (!process.env.ADMIN_PASSWORD) {
      console.log(`🔒 A secure random password was generated. It has NOT been logged for security reasons.`);
      console.log(`To set a known password, please provide ADMIN_PASSWORD in your .env file and run this script again after deleting the admin user.`);
    } else {
      console.log("Password: <set via ADMIN_PASSWORD env var>");
    }
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to seed admin:", error.message);
    process.exit(1);
  }
};

seedAdmin();
