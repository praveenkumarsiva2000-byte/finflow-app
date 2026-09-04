const nodemailer = require("nodemailer");

let transporter = null;
let attempted = false;

function getTransporter() {
  if (attempted) return transporter;
  attempted = true;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn("[email] SMTP not configured — emails will be logged to console instead of sent.");
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

async function sendMail({ to, subject, html }) {
  const t = getTransporter();
  if (!t) {
    console.log(`[email:dev] To: ${to} | Subject: ${subject}\n${html.replace(/<[^>]+>/g, " ").trim()}`);
    return;
  }

  try {
    await t.sendMail({
      from: process.env.EMAIL_FROM || "Cashlyne <no-reply@cashlyne.app>",
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error(`[email] Failed to send to ${to}:`, err.message);
  }
}

const wrap = (title, bodyHtml) => `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1a1a1a;">
    <h2 style="color:#0d87f0;margin-bottom:4px;">Cashlyne</h2>
    <h3 style="margin-top:0;">${title}</h3>
    ${bodyHtml}
    <p style="color:#888;font-size:12px;margin-top:32px;">You're receiving this because of your Cashlyne notification preferences. Manage them anytime in your Profile settings.</p>
  </div>
`;

module.exports = {
  sendMail,
  templates: {
    otp: (code) => wrap(
      "Your password reset code",
      `<p>Use the code below to reset your password. It expires in 10 minutes.</p>
       <p style="font-size:32px;font-weight:bold;letter-spacing:6px;color:#0d87f0;">${code}</p>
       <p>If you didn't request this, you can safely ignore this email.</p>`
    ),
    loginOtp: (code) => wrap(
      "Your sign-in code",
      `<p>Use the code below to finish signing in to Cashlyne. It expires in 10 minutes.</p>
       <p style="font-size:32px;font-weight:bold;letter-spacing:6px;color:#0d87f0;">${code}</p>
       <p>If you didn't try to sign in, secure your account by changing your password.</p>`
    ),
    budgetAlert: ({ category, spent, limit, pct, over }) => wrap(
      over ? `You're over budget on ${category}` : `You're approaching your ${category} budget`,
      `<p>Spent <strong>${spent}</strong> of <strong>${limit}</strong> (${pct.toFixed(0)}%) this period.</p>`
    ),
    recurringReminder: ({ category, amount, dueDate }) => wrap(
      "Upcoming recurring expense",
      `<p>Your recurring <strong>${category}</strong> expense of <strong>${amount}</strong> is due on <strong>${dueDate}</strong>.</p>`
    ),
    goalReminder: (goals) => wrap(
      "Your goal progress this week",
      `<ul>${goals.map((g) => `<li>${g.name}: ${g.saved} / ${g.target} (${g.pct.toFixed(0)}%)${g.daysLeft != null ? ` — ${g.daysLeft} days left` : ""}</li>`).join("")}</ul>`
    ),
    weeklyReport: ({ income, expenses, net }) => wrap(
      "Your weekly financial summary",
      `<p>Income: <strong>${income}</strong></p><p>Expenses: <strong>${expenses}</strong></p><p>Net: <strong>${net}</strong></p>`
    ),
  },
};
