const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true' || parseInt(process.env.SMTP_PORT || '465') === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS?.replace(/"/g, ''), // strip quotes if any
  },
});

async function main() {
  console.log("Using User:", process.env.SMTP_USER);
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM}>`,
      to: process.env.SMTP_USER,
      subject: "Test Email from NexaHR",
      text: "This is a test email.",
    });
    console.log("Message sent successfully: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:");
    console.error(error);
  }
}

main();
