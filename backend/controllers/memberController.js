const asyncHandler = require("express-async-handler");
const Member = require("../models/Member");
const { logActivity } = require("./activityController");
const exceljs = require("exceljs");
const fs = require("fs");

const generateMembershipId = async () => {
  const count = await Member.countDocuments();
  return `LIB-${String(count + 1001)}`;
};

// @desc    Get all members
// @route   GET /api/members
const getMembers = asyncHandler(async (req, res) => {
  const { search } = req.query;
  let query = { status: { $ne: "inactive" } };
  
  if (req.query.includeInactive === "true") {
    delete query.status;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { membershipId: { $regex: search, $options: "i" } },
    ];
  }
  const members = await Member.find(query).sort({ createdAt: -1 });
  res.json(members);
});

// @desc    Get single member
// @route   GET /api/members/:id
const getMemberById = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id);
  if (!member) {
    res.status(404);
    throw new Error("Member not found");
  }
  res.json(member);
});

// @desc    Create a member
// @route   POST /api/members
const createMember = asyncHandler(async (req, res) => {
  const { name, email, phone, address } = req.body;
  if (!name || !email || !phone) {
    res.status(400);
    throw new Error("Please provide name, email and phone");
  }

  const membershipId = await generateMembershipId();

  const member = await Member.create({ name, email, phone, address, membershipId });
  
  await logActivity("Add Member", `Added member: ${member.name}`, req.user?._id);

  res.status(201).json(member);
});

// @desc    Update a member
// @route   PUT /api/members/:id
const updateMember = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id);
  if (!member) {
    res.status(404);
    throw new Error("Member not found");
  }
  Object.assign(member, req.body);
  const updated = await member.save();
  
  await logActivity("Update Member", `Updated member: ${updated.name}`, req.user?._id);

  res.json(updated);
});

// @desc    Deactivate a member (soft delete)
// @route   DELETE /api/members/:id
const deleteMember = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id);
  if (!member) {
    res.status(404);
    throw new Error("Member not found");
  }
  
  member.status = "inactive";
  await member.save();
  
  await logActivity("Deactivate Member", `Deactivated member: ${member.name}`, req.user?._id);
  
  res.json({ message: "Member deactivated successfully" });
});

// @desc    Bulk upload members from Excel
// @route   POST /api/members/bulk-upload
const bulkUploadMembers = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No file uploaded");
  }

  const workbook = new exceljs.Workbook();
  await workbook.xlsx.readFile(req.file.path);
  const worksheet = workbook.getWorksheet(1);

  if (!worksheet) {
    res.status(400);
    throw new Error("Invalid Excel file format");
  }

  const membersToAdd = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header

    // Expected columns: Name, Email, Phone, Address
    const name = row.getCell(1).value?.toString()?.trim();
    const email = row.getCell(2).value?.toString()?.trim();
    const phone = row.getCell(3).value?.toString()?.trim();
    const address = row.getCell(4).value?.toString()?.trim() || "";

    if (name && email && phone) {
      membersToAdd.push({ name, email, phone, address });
    }
  });

  const addedMembers = [];
  let count = await Member.countDocuments();

  for (const memberData of membersToAdd) {
    let member = await Member.findOne({ email: memberData.email });
    if (!member) {
      memberData.membershipId = `LIB-${String(count + 1001)}`;
      member = await Member.create(memberData);
      addedMembers.push(member);
      count++;
    }
  }

  // Clean up uploaded file
  if (req.file.path && fs.existsSync(req.file.path)) {
    fs.unlinkSync(req.file.path);
  }

  res.status(201).json({ message: `${addedMembers.length} members successfully imported.` });
});

module.exports = { getMembers, getMemberById, createMember, updateMember, deleteMember, bulkUploadMembers };
