const asyncHandler = require("express-async-handler");
const ActivityLog = require("../models/ActivityLog");

// @desc    Get all activity logs
// @route   GET /api/activity
const getActivities = asyncHandler(async (req, res) => {
  const activities = await ActivityLog.find()
    .populate("adminId", "name email")
    .sort({ createdAt: -1 })
    .limit(100);
  res.json(activities);
});

// Helper function to log activity internally from other controllers
const logActivity = async (action, description, adminId) => {
  try {
    await ActivityLog.create({
      action,
      description,
      adminId
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

module.exports = { getActivities, logActivity };
