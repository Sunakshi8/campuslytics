const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

/**
 * Sends an email if SMTP is configured; otherwise logs to console and resolves
 * silently so the rest of the app (shortlisting, interview scheduling, etc.)
 * never fails just because email isn't set up yet.
 */
async function sendEmail({ to, subject, html }) {
  const t = getTransporter();
  if (!t) {
    console.log(`[email skipped - SMTP not configured] To: ${to} | Subject: ${subject}`);
    return { skipped: true };
  }
  try {
    await t.sendMail({
      from: process.env.EMAIL_FROM || 'Campuslytics <no-reply@campuslytics.com>',
      to,
      subject,
      html,
    });
    return { skipped: false, sent: true };
  } catch (err) {
    console.error('Email send failed:', err.message);
    return { skipped: false, sent: false, error: err.message };
  }
}

module.exports = sendEmail;
