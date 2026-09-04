const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// Security Packages
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

dotenv.config();

require("./cron/dueNotificationCron"); // Initialize cron jobs

const User = require("./models/User");
const bcrypt = require("bcryptjs");

const startServer = async () => {
  await connectDB();
  
  // Ensure admin user exists
  try {
    const adminExists = await User.findOne({ email: "admin@example.com" });
    if (!adminExists) {
      const crypto = require("crypto");
      const defaultPassword = process.env.ADMIN_PASSWORD || crypto.randomBytes(8).toString("hex");
      
      await User.create({
        name: "System Admin",
        email: "admin@example.com",
        password: defaultPassword,
        role: "admin",
      });
      console.log("✅ Admin user seeded automatically.");
      
      if (!process.env.ADMIN_PASSWORD) {
        console.log(`\n======================================================`);
        console.log(`🔒 SECURE ADMIN PASSWORD GENERATED: ${defaultPassword}`);
        console.log(`   Please save this password! You will need it to login.`);
        console.log(`======================================================\n`);
      }
    }
  } catch (error) {
    console.error("❌ Failed to verify/seed admin user:", error.message);
  }

  const app = express();

// Accept any localhost/127.0.0.1 port during local development, so it doesn't
// break every time Vite picks a different port (5173, 5174, 5175, ...).
// In production, only CLIENT_URL (set in .env) is allowed.
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173").split(",");
const isLocalhost = (origin) => /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // same-origin / server-to-server / curl
      if (allowedOrigins.includes(origin) || isLocalhost(origin)) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());

// --- Security Hardening Middlewares ---
// Set security HTTP headers
app.use(helmet());

// Rate Limiting: Limit each IP to 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use("/api", limiter);

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data Sanitization against XSS
app.use(xss());

// Prevent HTTP Parameter Pollution
app.use(hpp());
// ---------------------------------------

app.get("/", (req, res) => {
  res.json({ message: "📚 Library Management System API is running..." });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/books", require("./routes/bookRoutes"));
app.use("/api/members", require("./routes/memberRoutes"));
app.use("/api/transactions", require("./routes/transactionRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/activity", require("./routes/activityRoutes"));
app.use("/api/settings", require("./routes/settingsRoutes"));

  app.use(notFound);
  app.use(errorHandler);

  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};

startServer();
