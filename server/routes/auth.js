const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const auth = require("../middleware/auth");
const { sendMail, templates } = require("../utils/email");

const router = express.Router();

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || "7d" });

const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Please try again later." },
});

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;
const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

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

      if (user.preferences?.security?.mfaEnabled) {
        const otp = generateOtp();
        user.loginOtpHash = await bcrypt.hash(otp, 10);
        user.loginOtpExpires = new Date(Date.now() + OTP_EXPIRY_MS);
        user.loginOtpAttempts = 0;
        await user.save();

        await sendMail({ to: user.email, subject: "Your Cashlyne sign-in code", html: templates.loginOtp(otp) });
        return res.json({ mfaRequired: true, email: user.email });
      }

      const token = signToken(user._id);
      res.json({ token, user: user.toJSON() });
    } catch (err) {
      res.status(500).json({ error: "Server error during login." });
    }
  }
);

// ── POST /api/auth/verify-login-otp ───────────────────────────────────────
// Second step of sign-in when the account has email MFA enabled.
router.post(
  "/verify-login-otp",
  resetLimiter,
  [
    body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
    body("otp").isLength({ min: 6, max: 6 }).withMessage("Enter the 6-digit code"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    try {
      const { email, otp } = req.body;
      const user = await User.findOne({ email }).select("+loginOtpHash +loginOtpExpires +loginOtpAttempts");
      if (!user || !user.loginOtpHash || !user.loginOtpExpires) {
        return res.status(400).json({ error: "Invalid or expired code." });
      }
      if (user.loginOtpExpires < new Date()) {
        return res.status(400).json({ error: "Code expired. Please sign in again." });
      }
      if (user.loginOtpAttempts >= MAX_OTP_ATTEMPTS) {
        return res.status(429).json({ error: "Too many incorrect attempts. Please sign in again." });
      }

      const isMatch = await bcrypt.compare(otp, user.loginOtpHash);
      if (!isMatch) {
        user.loginOtpAttempts += 1;
        await user.save();
        return res.status(400).json({ error: "Incorrect code." });
      }

      // Single-use: clear the OTP once verified.
      user.loginOtpHash = undefined;
      user.loginOtpExpires = undefined;
      user.loginOtpAttempts = 0;
      await user.save();

      const token = signToken(user._id);
      res.json({ token, user: user.toJSON() });
    } catch (err) {
      res.status(500).json({ error: "Server error during code verification." });
    }
  }
);

// ── POST /api/auth/forgot-password ────────────────────────────────────────
// Always responds with a generic message to avoid leaking whether an email is registered.
router.post(
  "/forgot-password",
  resetLimiter,
  [body("email").isEmail().withMessage("Valid email required").normalizeEmail()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    const generic = { message: "If an account exists for that email, a reset code has been sent." };

    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.json(generic);

      const otp = generateOtp();
      user.resetOtpHash = await bcrypt.hash(otp, 10);
      user.resetOtpExpires = new Date(Date.now() + OTP_EXPIRY_MS);
      user.resetOtpAttempts = 0;
      await user.save();

      await sendMail({ to: user.email, subject: "Your Cashlyne password reset code", html: templates.otp(otp) });
      res.json(generic);
    } catch (err) {
      res.status(500).json({ error: "Server error during password reset request." });
    }
  }
);

// ── POST /api/auth/verify-otp ─────────────────────────────────────────────
router.post(
  "/verify-otp",
  resetLimiter,
  [
    body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
    body("otp").isLength({ min: 6, max: 6 }).withMessage("Enter the 6-digit code"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    try {
      const { email, otp } = req.body;
      const user = await User.findOne({ email }).select("+resetOtpHash +resetOtpExpires +resetOtpAttempts");
      if (!user || !user.resetOtpHash || !user.resetOtpExpires) {
        return res.status(400).json({ error: "Invalid or expired code." });
      }
      if (user.resetOtpExpires < new Date()) {
        return res.status(400).json({ error: "Code expired. Please request a new one." });
      }
      if (user.resetOtpAttempts >= MAX_OTP_ATTEMPTS) {
        return res.status(429).json({ error: "Too many incorrect attempts. Please request a new code." });
      }

      const isMatch = await bcrypt.compare(otp, user.resetOtpHash);
      if (!isMatch) {
        user.resetOtpAttempts += 1;
        await user.save();
        return res.status(400).json({ error: "Incorrect code." });
      }

      // Single-use: clear the OTP once verified.
      user.resetOtpHash = undefined;
      user.resetOtpExpires = undefined;
      user.resetOtpAttempts = 0;
      await user.save();

      const resetToken = jwt.sign({ userId: user._id, purpose: "reset" }, process.env.JWT_SECRET, { expiresIn: "10m" });
      res.json({ resetToken });
    } catch (err) {
      res.status(500).json({ error: "Server error during code verification." });
    }
  }
);

// ── POST /api/auth/reset-password ────────────────────────────────────────
router.post(
  "/reset-password",
  resetLimiter,
  [
    body("resetToken").notEmpty().withMessage("Reset token is required"),
    body("newPassword").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    try {
      const { resetToken, newPassword } = req.body;
      let decoded;
      try {
        decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
      } catch {
        return res.status(400).json({ error: "Invalid or expired reset session. Please start over." });
      }
      if (decoded.purpose !== "reset") return res.status(400).json({ error: "Invalid reset session." });

      const user = await User.findById(decoded.userId);
      if (!user) return res.status(404).json({ error: "Account not found." });

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
    const { name, email, preferences } = req.body;

    if (email) {
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({ error: "Please enter a valid email." });
      }
      const taken = await User.findOne({ email: email.toLowerCase(), _id: { $ne: req.userId } });
      if (taken) return res.status(400).json({ error: "An account with this email already exists." });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        ...(name && { name }),
        ...(email && { email: email.toLowerCase() }),
        ...(preferences && { preferences }),
      },
      { new: true, runValidators: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

module.exports = router;
