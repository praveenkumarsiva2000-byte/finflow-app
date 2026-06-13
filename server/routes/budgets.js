const express = require("express");
const { body, validationResult } = require("express-validator");
const Budget = require("../models/Budget");
const auth = require("../middleware/auth");

const router = express.Router();
router.use(auth);

// GET /api/budgets
router.get("/", async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch budgets." });
  }
});

// POST /api/budgets
router.post(
  "/",
  [
    body("category").notEmpty().withMessage("Category is required"),
    body("limit").isNumeric().custom((v) => v > 0).withMessage("Limit must be positive"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    try {
      const { category, limit, period, description } = req.body;
      // Replace existing budget for same category
      const existing = await Budget.findOne({ userId: req.userId, category });
      let budget;
      if (existing) {
        existing.limit = limit;
        existing.period = period || "monthly";
        if (description !== undefined) existing.description = description;
        budget = await existing.save();
      } else {
        budget = await Budget.create({ userId: req.userId, category, limit, period, description });
      }
      res.status(201).json(budget);
    } catch (err) {
      res.status(500).json({ error: "Failed to save budget." });
    }
  }
);

// DELETE /api/budgets/all
router.delete("/all", async (req, res) => {
  try {
    await Budget.deleteMany({ userId: req.userId });
    res.json({ message: "All budgets deleted." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete budgets." });
  }
});

// DELETE /api/budgets/:id
router.delete("/:id", async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!budget) return res.status(404).json({ error: "Budget not found." });
    res.json({ message: "Budget deleted.", id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete budget." });
  }
});

// PUT /api/budgets/:id
router.put("/:id", async (req, res) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!budget) return res.status(404).json({ error: "Budget not found." });
    res.json(budget);
  } catch (err) {
    res.status(500).json({ error: "Failed to update budget." });
  }
});

module.exports = router;
