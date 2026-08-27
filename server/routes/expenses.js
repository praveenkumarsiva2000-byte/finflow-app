const express = require("express");
const { body, validationResult } = require("express-validator");
const Expense = require("../models/Expense");
const auth = require("../middleware/auth");
const { getPeriodKey, getDueDate } = require("../utils/recurring");

const router = express.Router();

// All routes require auth
router.use(auth);

// ── GET /api/expenses ─────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { category, dateFrom, dateTo, search } = req.query;
    const filter = { userId: req.userId };
    if (category && category !== "all") filter.category = category;
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = dateFrom;
      if (dateTo) filter.date.$lte = dateTo;
    }
    if (search) filter.note = { $regex: search, $options: "i" };

    const expenses = await Expense.find(filter).sort({ date: -1, createdAt: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch expenses." });
  }
});

// ── POST /api/expenses/generate-recurring ─────────────────────────────────
// Creates expense entries for recurring templates for the current period (daily/weekly/monthly/yearly) if not already created
router.post("/generate-recurring", async (req, res) => {
  try {
    const recurringTemplates = await Expense.find({ userId: req.userId, isRecurring: true, recurringSourceId: null });
    const now = new Date();
    const created = [];

    for (const t of recurringTemplates) {
      const frequency = t.frequency || "monthly";
      const periodKey = getPeriodKey(frequency, now);

      // check if this template already generated an instance for the current period
      const exists = await Expense.findOne({ userId: req.userId, recurringSourceId: t._id, recurringPeriodKey: periodKey });
      if (exists) continue;

      const dateStr = getDueDate(frequency, t.date, now);
      const exp = await Expense.create({
        userId: req.userId,
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

    res.json({ created });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate recurring expenses." });
  }
});

// ── POST /api/expenses ────────────────────────────────────────────────────
router.post(
  "/",
  [
    body("amount").isNumeric().withMessage("Amount must be a number").custom((v) => v > 0).withMessage("Amount must be positive"),
    body("category").notEmpty().withMessage("Category is required"),
    body("date").notEmpty().withMessage("Date is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    try {
      const { amount, category, date, note, isRecurring, frequency } = req.body;
      const expense = await Expense.create({
        userId: req.userId, amount, category, date, note, isRecurring,
        frequency: isRecurring ? (frequency || "monthly") : undefined,
      });
      res.status(201).json(expense);
    } catch (err) {
      res.status(500).json({ error: "Failed to add expense." });
    }
  }
);

// ── DELETE /api/expenses/all ──────────────────────────────────────────────
router.delete("/all", async (req, res) => {
  try {
    await Expense.deleteMany({ userId: req.userId });
    res.json({ message: "All expenses deleted." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete expenses." });
  }
});

// ── DELETE /api/expenses/:id ──────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!expense) return res.status(404).json({ error: "Expense not found." });
    res.json({ message: "Expense deleted.", id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete expense." });
  }
});

// ── PUT /api/expenses/:id ─────────────────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const updated = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: "Expense not found." });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update expense." });
  }
});

module.exports = router;
