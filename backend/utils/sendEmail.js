const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("EMAIL NOT CONFIGURED - printing instead of sending:");
    console.log("To: " + to);
    console.log("Subject: " + subject);
    console.log(html);
    return { simulated: true };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || "\"SSISM Library\" <" + process.env.EMAIL_USER + ">",
    to,
    subject,
    html,
  });

  console.log("EMAIL SENT - messageId:", info.messageId);
  console.log("EMAIL SENT - response:", info.response);
  console.log("EMAIL SENT - accepted:", info.accepted);
  console.log("EMAIL SENT - rejected:", info.rejected);

  return { simulated: false };
};

module.exports = sendEmail;