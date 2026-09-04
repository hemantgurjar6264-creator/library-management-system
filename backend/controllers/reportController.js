const asyncHandler = require("express-async-handler");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit-table");
const Transaction = require("../models/Transaction");
const Book = require("../models/Book");
const Member = require("../models/Member");
const BookCopy = require("../models/BookCopy");

const monthRange = (month, year) => {
  const m = month ? Number(month) - 1 : new Date().getMonth();
  const y = year ? Number(year) : new Date().getFullYear();
  const start = new Date(y, m, 1, 0, 0, 0);
  const end = new Date(y, m + 1, 0, 23, 59, 59);
  return { start, end, label: start.toLocaleDateString("en-IN", { month: "long", year: "numeric" }) };
};

// Builds the full report dataset for a given month/year
const buildMonthlyReportData = async (month, year) => {
  const { start, end, label } = monthRange(month, year);
  const now = new Date();

  const issuedThisMonth = await Transaction.find({ issueDate: { $gte: start, $lte: end } })
    .populate("book", "title author isbn")
    .populate("member", "name membershipId")
    .sort({ issueDate: 1 });

  const returnedThisMonth = await Transaction.find({
    returnDate: { $gte: start, $lte: end },
    status: "returned",
  })
    .populate("book", "title author isbn")
    .populate("member", "name membershipId")
    .sort({ returnDate: 1 });

  const overdueList = await Transaction.find({
    status: { $in: ["issued", "overdue"] },
    dueDate: { $lt: now },
  })
    .populate("book", "title author isbn")
    .populate("member", "name membershipId email phone")
    .sort({ dueDate: 1 });

  const finesCollectedThisMonth = returnedThisMonth.reduce((sum, t) => sum + (t.fine || 0), 0);

  const totalBooks = await Book.countDocuments({ isArchived: { $ne: true } });
  const totalCopies = await BookCopy.countDocuments();
  const availableCopies = await BookCopy.countDocuments({ status: "available" });
  const totalMembers = await Member.countDocuments({ status: { $ne: "inactive" } });
  const activeMembers = await Member.countDocuments({ status: "active" });

  const overdueWithFine = overdueList.map((t) => {
    const daysLate = Math.ceil((now - t.dueDate) / (1000 * 60 * 60 * 24));
    const fine = daysLate * (Number(process.env.FINE_PER_DAY) || 5);
    return { transaction: t, daysLate, estimatedFine: fine };
  });

  return {
    label,
    start,
    end,
    issuedThisMonth,
    returnedThisMonth,
    overdueList: overdueWithFine,
    finesCollectedThisMonth,
    totals: { totalBooks, totalCopies, availableCopies, totalMembers, activeMembers },
  };
};

// @desc    Monthly report summary (JSON, for the Reports page)
// @route   GET /api/reports/summary
const getMonthlyReportSummary = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const data = await buildMonthlyReportData(month, year);

  res.json({
    label: data.label,
    booksIssuedCount: data.issuedThisMonth.length,
    booksReturnedCount: data.returnedThisMonth.length,
    overdueCount: data.overdueList.length,
    finesCollectedThisMonth: data.finesCollectedThisMonth,
    estimatedPendingFines: data.overdueList.reduce((s, o) => s + o.estimatedFine, 0),
    totals: data.totals,
    overduePreview: data.overdueList.slice(0, 10).map((o) => ({
      book: o.transaction.book?.title,
      member: o.transaction.member?.name,
      dueDate: o.transaction.dueDate,
      daysLate: o.daysLate,
      estimatedFine: o.estimatedFine,
    })),
  });
});

// @desc    Export monthly report as Excel (.xlsx)
// @route   GET /api/reports/export/excel
const exportExcelReport = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const data = await buildMonthlyReportData(month, year);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "SSISM Library Management System";
  workbook.created = new Date();

  // --- Summary sheet ---
  const summarySheet = workbook.addWorksheet("Summary");
  summarySheet.columns = [
    { header: "Metric", key: "metric", width: 32 },
    { header: "Value", key: "value", width: 20 },
  ];
  summarySheet.addRows([
    { metric: `Report period`, value: data.label },
    { metric: "Total titles in catalog", value: data.totals.totalBooks },
    { metric: "Total copies", value: data.totals.totalCopies },
    { metric: "Available copies", value: data.totals.availableCopies },
    { metric: "Total members", value: data.totals.totalMembers },
    { metric: "Active members", value: data.totals.activeMembers },
    { metric: "Books issued this month", value: data.issuedThisMonth.length },
    { metric: "Books returned this month", value: data.returnedThisMonth.length },
    { metric: "Fines collected this month (₹)", value: data.finesCollectedThisMonth },
    { metric: "Currently overdue loans", value: data.overdueList.length },
    {
      metric: "Estimated pending fines (₹)",
      value: data.overdueList.reduce((s, o) => s + o.estimatedFine, 0),
    },
  ]);
  summarySheet.getRow(1).font = { bold: true };

  // --- Issued sheet ---
  const issuedSheet = workbook.addWorksheet("Issued This Month");
  issuedSheet.columns = [
    { header: "Book", key: "book", width: 30 },
    { header: "ISBN", key: "isbn", width: 18 },
    { header: "Member", key: "member", width: 24 },
    { header: "Membership ID", key: "membershipId", width: 18 },
    { header: "Issue Date", key: "issueDate", width: 16 },
    { header: "Due Date", key: "dueDate", width: 16 },
    { header: "Status", key: "status", width: 12 },
  ];
  issuedSheet.getRow(1).font = { bold: true };
  data.issuedThisMonth.forEach((t) => {
    issuedSheet.addRow({
      book: t.book?.title || "—",
      isbn: t.book?.isbn || "—",
      member: t.member?.name || "—",
      membershipId: t.member?.membershipId || "—",
      issueDate: t.issueDate?.toLocaleDateString("en-IN"),
      dueDate: t.dueDate?.toLocaleDateString("en-IN"),
      status: t.status,
    });
  });

  // --- Overdue sheet ---
  const overdueSheet = workbook.addWorksheet("Overdue List");
  overdueSheet.columns = [
    { header: "Book", key: "book", width: 30 },
    { header: "Member", key: "member", width: 24 },
    { header: "Membership ID", key: "membershipId", width: 18 },
    { header: "Due Date", key: "dueDate", width: 16 },
    { header: "Days Late", key: "daysLate", width: 12 },
    { header: "Estimated Fine (₹)", key: "fine", width: 18 },
  ];
  overdueSheet.getRow(1).font = { bold: true };
  data.overdueList.forEach((o) => {
    overdueSheet.addRow({
      book: o.transaction.book?.title || "—",
      member: o.transaction.member?.name || "—",
      membershipId: o.transaction.member?.membershipId || "—",
      dueDate: o.transaction.dueDate?.toLocaleDateString("en-IN"),
      daysLate: o.daysLate,
      fine: o.estimatedFine,
    });
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="library-report-${data.label.replace(" ", "-")}.xlsx"`
  );

  await workbook.xlsx.write(res);
  res.end();
});

// @desc    Export monthly report as PDF
// @route   GET /api/reports/export/pdf
const exportPdfReport = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const data = await buildMonthlyReportData(month, year);

  const doc = new PDFDocument({ margin: 50, size: "A4" });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="library-report-${data.label.replace(" ", "-")}.pdf"`
  );
  doc.pipe(res);

  // Header
  doc.fontSize(22).font('Helvetica-Bold').fillColor("#2c3e50").text("SSISM Library", { align: "center" });
  doc.fontSize(14).font('Helvetica').fillColor("#7f8c8d").text(`Monthly Report — ${data.label}`, { align: "center" });
  doc.moveDown(2);

  // Summary Section
  doc.fontSize(16).font('Helvetica-Bold').fillColor("#34495e").text("Summary Snapshot", { underline: false });
  doc.moveDown(0.5);
  
  const summaryTable = {
    headers: [
      { label: "Metric", property: "metric", width: 300, renderer: null },
      { label: "Value", property: "value", width: 150, renderer: null }
    ],
    datas: [
      { metric: "Total titles in catalog", value: data.totals.totalBooks.toString() },
      { metric: "Total copies", value: data.totals.totalCopies.toString() },
      { metric: "Available copies", value: data.totals.availableCopies.toString() },
      { metric: "Total members", value: data.totals.totalMembers.toString() },
      { metric: "Active members", value: data.totals.activeMembers.toString() },
      { metric: "Books issued this month", value: data.issuedThisMonth.length.toString() },
      { metric: "Books returned this month", value: data.returnedThisMonth.length.toString() },
      { metric: "Fines collected this month", value: `Rs. ${data.finesCollectedThisMonth}` },
      { metric: "Currently overdue loans", value: data.overdueList.length.toString() },
      { metric: "Estimated pending fines", value: `Rs. ${data.overdueList.reduce((s, o) => s + o.estimatedFine, 0)}` },
    ],
  };

  await doc.table(summaryTable, { 
    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
    prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
      doc.font("Helvetica").fontSize(10);
      indexColumn === 0 && doc.addBackground(rectRow, (indexRow % 2 ? '#fdfdfd' : '#f4f6f7'), 0.15);
    }
  });

  doc.moveDown(2);

  // Overdue List Section
  doc.fontSize(16).font('Helvetica-Bold').fillColor("#FF6B00").text("Overdue List", { underline: false });
  doc.moveDown(0.5);
  
  if (data.overdueList.length === 0) {
    doc.fontSize(11).font('Helvetica').fillColor("#7f8c8d").text("No overdue loans. All books are on time.");
  } else {
    const overdueTable = {
      headers: [
        { label: "Book", property: "book", width: 120 },
        { label: "Member", property: "member", width: 100 },
        { label: "ID", property: "id", width: 60 },
        { label: "Due Date", property: "dueDate", width: 70 },
        { label: "Late (Days)", property: "daysLate", width: 60 },
        { label: "Fine (Rs)", property: "fine", width: 60 },
      ],
      datas: data.overdueList.map(o => ({
        book: o.transaction.book?.title || "—",
        member: o.transaction.member?.name || "—",
        id: o.transaction.member?.membershipId || "—",
        dueDate: o.transaction.dueDate?.toLocaleDateString("en-IN") || "—",
        daysLate: o.daysLate.toString(),
        fine: o.estimatedFine.toString()
      }))
    };
    await doc.table(overdueTable, {
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(9),
      prepareRow: (row, indexColumn, indexRow, rectRow) => {
        doc.font("Helvetica").fontSize(9).fillColor("#333333");
        indexColumn === 0 && doc.addBackground(rectRow, (indexRow % 2 ? '#ffffff' : '#fcfcfc'), 0.15);
      }
    });
  }

  doc.moveDown(2);

  // Books Issued This Month Section
  doc.fontSize(16).font('Helvetica-Bold').fillColor("#FF6B00").text("Books Issued This Month", { underline: false });
  doc.moveDown(0.5);
  
  if (data.issuedThisMonth.length === 0) {
    doc.fontSize(11).font('Helvetica').fillColor("#7f8c8d").text("No books were issued this month.");
  } else {
    const issuedTable = {
      headers: [
        { label: "Book", property: "book", width: 130 },
        { label: "Member", property: "member", width: 100 },
        { label: "ID", property: "id", width: 60 },
        { label: "Issued Date", property: "issueDate", width: 70 },
        { label: "Due Date", property: "dueDate", width: 70 },
        { label: "Status", property: "status", width: 60 },
      ],
      datas: data.issuedThisMonth.map(t => ({
        book: t.book?.title || "—",
        member: t.member?.name || "—",
        id: t.member?.membershipId || "—",
        issueDate: t.issueDate?.toLocaleDateString("en-IN") || "—",
        dueDate: t.dueDate?.toLocaleDateString("en-IN") || "—",
        status: t.status
      }))
    };
    await doc.table(issuedTable, {
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(9),
      prepareRow: (row, indexColumn, indexRow, rectRow) => {
        doc.font("Helvetica").fontSize(9).fillColor("#333333");
        indexColumn === 0 && doc.addBackground(rectRow, (indexRow % 2 ? '#ffffff' : '#fcfcfc'), 0.15);
      }
    });
  }

  doc.end();
});

module.exports = { getMonthlyReportSummary, exportExcelReport, exportPdfReport };
