require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const connectDB = require("./config/db");
const { runDailyChecks, runWeeklyChecks } = require("./services/notifications");

const app = express();
const PORT = process.env.PORT || 5000;

// ── Connect to MongoDB ─────────────────────────────────────────────────────
connectDB();

// ── Notification scheduler ─────────────────────────────────────────────────
// Daily: budget alerts + recurring expense reminders. Weekly (Mondays): goal reminders + spending summary.
cron.schedule("0 8 * * *", () => {
  runDailyChecks().catch((err) => console.error("[notifications] daily check failed:", err.message));
});
cron.schedule("0 8 * * 1", () => {
  runWeeklyChecks().catch((err) => console.error("[notifications] weekly check failed:", err.message));
});

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ─────────────────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth"));
app.use("/api/expenses", require("./routes/expenses"));
app.use("/api/incomes", require("./routes/incomes"));
app.use("/api/budgets", require("./routes/budgets"));
app.use("/api/goals", require("./routes/goals"));

// ── Health check ───────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Cashlyne API is running", timestamp: new Date().toISOString() });
});

// ── 404 handler ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
});

// ── Global error handler ───────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`🚀 Cashlyne API running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
});
