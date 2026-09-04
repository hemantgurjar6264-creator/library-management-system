const cron = require("node-cron");
const Transaction = require("../models/Transaction");
const sendEmail = require("../utils/sendEmail");

// Schedule task to run every day at 8:00 AM
cron.schedule("0 8 * * *", async () => {
  console.log("Running cron job: Checking for books due today...");
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Find all issued transactions where the due date is today
    const dueTodayTransactions = await Transaction.find({
      status: "issued",
      dueDate: { $gte: todayStart, $lte: todayEnd },
    }).populate("member", "name email")
      .populate("book", "title");

    if (dueTodayTransactions.length === 0) {
      console.log("No books due today.");
      return;
    }

    console.log(`Found ${dueTodayTransactions.length} books due today. Sending emails...`);

    for (const t of dueTodayTransactions) {
      const { member, book, dueDate } = t;

      if (!member || !member.email) {
        continue;
      }

      const emailSubject = "Library Book Due Today";
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <h2>Hello ${member.name},</h2>
          <p>This is a gentle reminder that the book <strong>"${book.title}"</strong> you borrowed from the library is due <strong>today</strong> (${dueDate.toLocaleDateString('en-IN')}).</p>
          <p>Please return it by today to avoid any late fees. From tomorrow, a daily fine will start applying as per the library rules.</p>
          <br>
          <p>Thank you,<br><strong>SSISM Library</strong></p>
        </div>
      `;

      try {
        await sendEmail({
          to: member.email,
          subject: emailSubject,
          html: emailHtml,
        });
        console.log(`Reminder email sent to ${member.email} for book: ${book.title}`);
      } catch (err) {
        console.error(`Failed to send email to ${member.email}:`, err.message);
      }
    }
  } catch (error) {
    console.error("Error running due date notification cron job:", error);
  }
});
