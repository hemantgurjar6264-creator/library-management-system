const asyncHandler = require("express-async-handler");
const Settings = require("../models/Settings");

// Helper to get or create settings
const getSettingsDoc = async () => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  return settings;
};

// @desc    Get system settings
// @route   GET /api/settings
const getSettings = asyncHandler(async (req, res) => {
  const settings = await getSettingsDoc();
  res.json(settings);
});

// @desc    Update system settings
// @route   PUT /api/settings
const updateSettings = asyncHandler(async (req, res) => {
  const settings = await getSettingsDoc();
  const { libraryName, loanDuration, finePerDay } = req.body;
  
  if (libraryName !== undefined) settings.libraryName = libraryName;
  if (loanDuration !== undefined) settings.loanDuration = loanDuration;
  if (finePerDay !== undefined) settings.finePerDay = finePerDay;

  const updatedSettings = await settings.save();
  res.json(updatedSettings);
});

module.exports = { getSettings, updateSettings, getSettingsDoc };
