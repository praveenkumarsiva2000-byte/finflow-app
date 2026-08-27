const User = require("../models/User");
const Budget = require("../models/Budget");
const Expense = require("../models/Expense");
const Income = require("../models/Income");
const Goal = require("../models/Goal");
const { sendMail, templates } = require("../utils/email");
const { getPeriodKey, getDueDate } = require("../utils/recurring");

const fmtMoney = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const toDateStr = (d) => d.toISOString().slice(0, 10);

function getPeriodStart(period, now) {
  if (period === "weekly") {
    const d = new Date(now);
    const diffToMonday = (d.getDay() + 6) % 7; // Monday = start of week
    d.setDate(d.getDate() - diffToMonday);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (period === "yearly") return new Date(now.getFullYear(), 0, 1);
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

// ── Budget alerts: 80% and 100% thresholds, once per crossing per period ───
async function checkBudgetAlerts() {
  const budgets = await Budget.find({});
  const now = new Date();

  for (const budget of budgets) {
    const user = await User.findById(budget.userId);
    if (!user || !user.preferences?.notifications?.budgetAlerts) continue;

    const periodKey = getPeriodKey(budget.period, now);
    if (budget.lastAlertPeriodKey !== periodKey) {
      budget.lastAlertLevel = 0;
      budget.lastAlertPeriodKey = periodKey;
    }

    const periodStart = getPeriodStart(budget.period, now);
    const expenses = await Expense.find({
      userId: budget.userId,
      category: budget.category,
      date: { $gte: toDateStr(periodStart), $lte: toDateStr(now) },
    });
    const spent = expenses.reduce((s, e) => s + e.amount, 0);
    const pct = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;

    let newLevel = null;
    if (pct >= 100 && budget.lastAlertLevel < 100) newLevel = 100;
    else if (pct >= 80 && budget.lastAlertLevel < 80) newLevel = 80;

    if (newLevel) {
      await sendMail({
        to: user.email,
        subject: newLevel >= 100 ? `Over budget: ${budget.category}` : `Approaching budget limit: ${budget.category}`,
        html: templates.budgetAlert({ category: budget.category, spent: fmtMoney(spent), limit: fmtMoney(budget.limit), pct, over: newLevel >= 100 }),
      });
      budget.lastAlertLevel = newLevel;
    }
    await budget.save();
  }
}

// ── Recurring expense reminders: due within 2 days, once per period ────────
async function checkRecurringReminders() {
  const recurringTemplates = await Expense.find({ isRecurring: true, recurringSourceId: null });
  const now = new Date();

  for (const t of recurringTemplates) {
    const user = await User.findById(t.userId);
    if (!user || !user.preferences?.notifications?.recurringReminders) continue;

    const frequency = t.frequency || "monthly";
    const periodKey = getPeriodKey(frequency, now);

    const alreadyGenerated = await Expense.findOne({ userId: t.userId, recurringSourceId: t._id, recurringPeriodKey: periodKey });
    if (alreadyGenerated || t.lastReminderPeriodKey === periodKey) continue;

    const dueDateStr = getDueDate(frequency, t.date, now);
    const daysUntil = Math.ceil((new Date(dueDateStr) - now) / 86400000);
    if (daysUntil < 0 || daysUntil > 2) continue;

    await sendMail({
      to: user.email,
      subject: `Upcoming recurring expense: ${t.category}`,
      html: templates.recurringReminder({ category: t.category, amount: fmtMoney(t.amount), dueDate: dueDateStr }),
    });
    t.lastReminderPeriodKey = periodKey;
    await t.save();
  }
}

// ── Weekly goal progress summary ────────────────────────────────────────────
async function sendGoalReminders() {
  const users = await User.find({});
  const now = new Date();

  for (const user of users) {
    if (!user.preferences?.notifications?.goalReminders) continue;
    const goals = await Goal.find({ userId: user._id, $expr: { $lt: ["$saved", "$target"] } });
    if (!goals.length) continue;

    const payload = goals.map((g) => ({
      name: g.name,
      saved: fmtMoney(g.saved),
      target: fmtMoney(g.target),
      pct: g.target > 0 ? (g.saved / g.target) * 100 : 0,
      daysLeft: g.deadline ? Math.ceil((new Date(g.deadline) - now) / 86400000) : null,
    }));

    await sendMail({ to: user.email, subject: "Your Cashlyne goal progress", html: templates.goalReminder(payload) });
  }
}

// ── Weekly income/expense summary ───────────────────────────────────────────
async function sendWeeklyReports() {
  const users = await User.find({});
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000);

  for (const user of users) {
    if (!user.preferences?.notifications?.weeklyReport) continue;

    const [expenses, incomes] = await Promise.all([
      Expense.find({ userId: user._id, date: { $gte: toDateStr(weekAgo), $lte: toDateStr(now) } }),
      Income.find({ userId: user._id, date: { $gte: toDateStr(weekAgo), $lte: toDateStr(now) } }),
    ]);
    const totalExp = expenses.reduce((s, e) => s + e.amount, 0);
    const totalInc = incomes.reduce((s, i) => s + i.amount, 0);

    await sendMail({
      to: user.email,
      subject: "Your weekly Cashlyne summary",
      html: templates.weeklyReport({ income: fmtMoney(totalInc), expenses: fmtMoney(totalExp), net: fmtMoney(totalInc - totalExp) }),
    });
  }
}

async function runDailyChecks() {
  await checkBudgetAlerts();
  await checkRecurringReminders();
}

async function runWeeklyChecks() {
  await sendGoalReminders();
  await sendWeeklyReports();
}

module.exports = {
  checkBudgetAlerts,
  checkRecurringReminders,
  sendGoalReminders,
  sendWeeklyReports,
  runDailyChecks,
  runWeeklyChecks,
};
