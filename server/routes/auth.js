const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || "7d" });

// ── POST /api/auth/signup ─────────────────────────────────────────────────
router.post(
  "/signup",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    try {
      const { name, email, password } = req.body;
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ error: "An account with this email already exists." });

      const user = await User.create({ name, email, password });
      res.status(201).json({ message: "Account created. Please sign in." });
    } catch (err) {
      res.status(500).json({ error: "Server error during signup." });
    }
  }
);

// ── POST /api/auth/login ──────────────────────────────────────────────────
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email }).select("+password");
      if (!user) return res.status(401).json({ error: "Invalid email or password." });

      const isMatch = await user.comparePassword(password);
      if (!isMatch) return res.status(401).json({ error: "Invalid email or password." });

      const token = signToken(user._id);
      res.json({ token, user: user.toJSON() });
    } catch (err) {
      res.status(500).json({ error: "Server error during login." });
    }
  }
);

// ── POST /api/auth/reset-password ────────────────────────────────────────
router.post(
  "/reset-password",
  [
    body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
    body("newPassword").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    try {
      const { email, newPassword } = req.body;
      const user = await User.findOne({ email }).select("+password");
      if (!user) return res.status(404).json({ error: "No account found with this email." });

      user.password = newPassword;
      await user.save();
      res.json({ message: "Password reset successfully." });
    } catch (err) {
      res.status(500).json({ error: "Server error during password reset." });
    }
  }
);

// ── GET /api/auth/profile ─────────────────────────────────────────────────
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

// ── PUT /api/auth/profile ─────────────────────────────────────────────────
router.put("/profile", auth, async (req, res) => {
  try {
    const { name, preferences } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { ...(name && { name }), ...(preferences && { preferences }) },
      { new: true, runValidators: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

module.exports = router;
