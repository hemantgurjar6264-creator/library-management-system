const asyncHandler = require("express-async-handler");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
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

  const totalBooks = await Book.countDocuments();
  const totalCopies = await BookCopy.countDocuments();
  const availableCopies = await BookCopy.countDocuments({ status: "available" });
  const totalMembers = await Member.countDocuments();
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

  const doc = new PDFDocument({ margin: 40, size: "A4" });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="library-report-${data.label.replace(" ", "-")}.pdf"`
  );
  doc.pipe(res);

  doc.fontSize(18).text("SSISM Library — Monthly Report", { align: "center" });
  doc.moveDown(0.2);
  doc.fontSize(12).fillColor("#666").text(data.label, { align: "center" });
  doc.moveDown(1);
  doc.fillColor("#000");

  doc.fontSize(14).text("Summary", { underline: true });
  doc.moveDown(0.3);
  doc.fontSize(10);
  const summaryLines = [
    `Total titles in catalog: ${data.totals.totalBooks}`,
    `Total copies: ${data.totals.totalCopies}  |  Available copies: ${data.totals.availableCopies}`,
    `Total members: ${data.totals.totalMembers}  |  Active members: ${data.totals.activeMembers}`,
    `Books issued this month: ${data.issuedThisMonth.length}`,
    `Books returned this month: ${data.returnedThisMonth.length}`,
    `Fines collected this month: Rs. ${data.finesCollectedThisMonth}`,
    `Currently overdue loans: ${data.overdueList.length}`,
    `Estimated pending fines: Rs. ${data.overdueList.reduce((s, o) => s + o.estimatedFine, 0)}`,
  ];
  summaryLines.forEach((line) => doc.text(line));
  doc.moveDown(1);

  doc.fontSize(14).text("Overdue List", { underline: true });
  doc.moveDown(0.3);
  doc.fontSize(9);
  if (data.overdueList.length === 0) {
    doc.text("No overdue loans. All books are on time.");
  } else {
    data.overdueList.forEach((o, i) => {
      doc.text(
        `${i + 1}. ${o.transaction.book?.title || "—"}  |  ${o.transaction.member?.name || "—"} (${
          o.transaction.member?.membershipId || "—"
        })  |  Due: ${o.transaction.dueDate?.toLocaleDateString("en-IN")}  |  ${o.daysLate} day(s) late  |  Fine: Rs. ${
          o.estimatedFine
        }`
      );
    });
  }
  doc.moveDown(1);

  doc.fontSize(14).text("Books Issued This Month", { underline: true });
  doc.moveDown(0.3);
  doc.fontSize(9);
  if (data.issuedThisMonth.length === 0) {
    doc.text("No books were issued this month.");
  } else {
    data.issuedThisMonth.forEach((t, i) => {
      doc.text(
        `${i + 1}. ${t.book?.title || "—"}  |  ${t.member?.name || "—"} (${
          t.member?.membershipId || "—"
        })  |  Issued: ${t.issueDate?.toLocaleDateString("en-IN")}  |  Due: ${t.dueDate?.toLocaleDateString(
          "en-IN"
        )}  |  Status: ${t.status}`
      );
    });
  }

  doc.end();
});

module.exports = { getMonthlyReportSummary, exportExcelReport, exportPdfReport };
