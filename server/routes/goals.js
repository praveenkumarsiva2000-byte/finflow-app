const express = require("express");
const { body, validationResult } = require("express-validator");
const Goal = require("../models/Goal");
const auth = require("../middleware/auth");

const router = express.Router();
router.use(auth);

// GET /api/goals
router.get("/", async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch goals." });
  }
});

// POST /api/goals
router.post(
  "/",
  [
    body("name").notEmpty().withMessage("Goal name is required"),
    body("target").isNumeric().custom((v) => v > 0).withMessage("Target must be positive"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    try {
      const { name, target, saved, deadline, emoji, iconId } = req.body;
      const goal = await Goal.create({ userId: req.userId, name, target, saved: saved || 0, deadline, emoji, iconId });
      res.status(201).json(goal);
    } catch (err) {
      res.status(500).json({ error: "Failed to create goal." });
    }
  }
);

// PUT /api/goals/:id  (update progress / edit)
router.put("/:id", async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!goal) return res.status(404).json({ error: "Goal not found." });
    res.json(goal);
  } catch (err) {
    res.status(500).json({ error: "Failed to update goal." });
  }
});

// DELETE /api/goals/all
router.delete("/all", async (req, res) => {
  try {
    await Goal.deleteMany({ userId: req.userId });
    res.json({ message: "All goals deleted." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete goals." });
  }
});

// DELETE /api/goals/:id
router.delete("/:id", async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!goal) return res.status(404).json({ error: "Goal not found." });
    res.json({ message: "Goal deleted.", id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete goal." });
  }
});

module.exports = router;
