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
    // Use environment variable or generate a random one if not provided.
    const crypto = require("crypto");
    const defaultPassword = process.env.ADMIN_PASSWORD || crypto.randomBytes(8).toString("hex");

    await User.create({
      name: "System Admin",
      email: email,
      password: defaultPassword,
      role: "admin",
    });

    console.log("✅ Admin user seeded successfully!");
    console.log(`Email: ${email}`);
    if (!process.env.ADMIN_PASSWORD) {
      console.log(`🔒 GENERATED PASSWORD: ${defaultPassword}`);
      console.log(`Please save this password! You will need it to login.`);
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
