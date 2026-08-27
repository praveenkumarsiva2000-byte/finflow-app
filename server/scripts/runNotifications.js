require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const { runDailyChecks, runWeeklyChecks } = require("../services/notifications");

(async () => {
  await connectDB();
  console.log("Running daily checks (budget alerts + recurring reminders)...");
  await runDailyChecks();
  console.log("Running weekly checks (goal reminders + weekly report)...");
  await runWeeklyChecks();
  console.log("Done.");
  await mongoose.connection.close();
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
