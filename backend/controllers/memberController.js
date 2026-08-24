const asyncHandler = require("express-async-handler");
const Member = require("../models/Member");

const generateMembershipId = async () => {
  const count = await Member.countDocuments();
  return `LIB-${String(count + 1001)}`;
};

// @desc    Get all members
// @route   GET /api/members
const getMembers = asyncHandler(async (req, res) => {
  const { search } = req.query;
  let query = {};
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
  res.json(updated);
});

// @desc    Delete a member
// @route   DELETE /api/members/:id
const deleteMember = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id);
  if (!member) {
    res.status(404);
    throw new Error("Member not found");
  }
  await member.deleteOne();
  res.json({ message: "Member removed successfully" });
});

module.exports = { getMembers, getMemberById, createMember, updateMember, deleteMember };
