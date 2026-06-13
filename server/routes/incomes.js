const express = require("express");
const { body, validationResult } = require("express-validator");
const Income = require("../models/Income");
const auth = require("../middleware/auth");

const router = express.Router();
router.use(auth);

// GET /api/incomes
router.get("/", async (req, res) => {
  try {
    const incomes = await Income.find({ userId: req.userId }).sort({ date: -1, createdAt: -1 });
    res.json(incomes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch incomes." });
  }
});

// POST /api/incomes
router.post(
  "/",
  [
    body("amount").isNumeric().custom((v) => v > 0).withMessage("Amount must be positive"),
    body("source").notEmpty().withMessage("Source is required"),
    body("date").notEmpty().withMessage("Date is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    try {
      const { amount, source, category, date, note, isRecurring } = req.body;
      const income = await Income.create({ userId: req.userId, amount, source, category, date, note, isRecurring });
      res.status(201).json(income);
    } catch (err) {
      res.status(500).json({ error: "Failed to add income." });
    }
  }
);

// DELETE /api/incomes/all
router.delete("/all", async (req, res) => {
  try {
    await Income.deleteMany({ userId: req.userId });
    res.json({ message: "All incomes deleted." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete incomes." });
  }
});

// DELETE /api/incomes/:id
router.delete("/:id", async (req, res) => {
  try {
    const income = await Income.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!income) return res.status(404).json({ error: "Income not found." });
    res.json({ message: "Income deleted.", id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete income." });
  }
});

// PUT /api/incomes/:id
router.put("/:id", async (req, res) => {
  try {
    const updated = await Income.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: "Income not found." });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update income." });
  }
});

module.exports = router;
