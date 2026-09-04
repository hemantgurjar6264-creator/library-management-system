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

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash("admin123", salt);
    
    // Create using the raw password; pre-save hook will hash it since we're using create
    // Actually we don't need to manually hash if we just rely on the pre-save hook. Let's do that.
    await User.create({
      name: "System Admin",
      email: email,
      password: "admin123",
      role: "admin",
    });

    console.log("✅ Admin user seeded successfully!");
    console.log(`Email: ${email}`);
    console.log(`Password: admin123`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to seed admin:", error.message);
    process.exit(1);
  }
};

seedAdmin();
