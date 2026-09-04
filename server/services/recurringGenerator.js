const Expense = require("../models/Expense");
const { getPeriodKey, getDueDate, addPeriod } = require("../utils/recurring");

// Walks forward one period at a time from the template's own date to now,
// creating any instance that hasn't been generated yet. Starts one period
// *after* the template's date since the template's own row already covers
// its own period.
async function generateRecurringForUser(userId) {
  const templates = await Expense.find({ userId, isRecurring: true, recurringSourceId: null });
  const now = new Date();
  const created = [];

  for (const t of templates) {
    const frequency = t.frequency || "monthly";
    let cursor = addPeriod(t.date, frequency);

    while (cursor <= now) {
      const periodKey = getPeriodKey(frequency, cursor);
      const exists = await Expense.findOne({ userId, recurringSourceId: t._id, recurringPeriodKey: periodKey });
      if (!exists) {
        const dateStr = getDueDate(frequency, t.date, cursor);
        const exp = await Expense.create({
          userId,
          amount: t.amount,
          category: t.category,
          date: dateStr,
          note: t.note || "",
          isRecurring: false,
          recurringSourceId: t._id,
          recurringPeriodKey: periodKey,
        });
        created.push(exp);
      }
      cursor = addPeriod(cursor, frequency);
    }
  }

  return created;
}

async function generateRecurringForAllUsers() {
  const userIds = await Expense.find({ isRecurring: true, recurringSourceId: null }).distinct("userId");
  for (const userId of userIds) {
    await generateRecurringForUser(userId);
  }
}

module.exports = { generateRecurringForUser, generateRecurringForAllUsers };
