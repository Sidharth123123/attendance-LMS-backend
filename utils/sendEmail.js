// utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
  try {
    // Create a transporter using Gmail SMTP with App Password
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,      // Your Gmail address
        pass: process.env.EMAIL_PASS,      // App Password generated in Gmail
      },
    });

    // Send the email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });

    console.log('Email sent: %s', info.messageId);
  } catch (err) {
    console.error('Error sending email:', err);
    throw new Error('Email sending failed');
  }
};

module.exports = sendEmail;
