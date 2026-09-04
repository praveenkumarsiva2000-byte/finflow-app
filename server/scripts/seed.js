require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");

const DEMO_EMAIL = "guest@cashlyne.app";
const DEMO_PASSWORD = "Guest@2026";

async function seed() {
  await connectDB();

  const existing = await User.findOne({ email: DEMO_EMAIL });
  if (existing) {
    console.log(`Demo user already exists: ${DEMO_EMAIL}`);
  } else {
    await User.create({ name: "Demo User", email: DEMO_EMAIL, password: DEMO_PASSWORD });
    console.log(`Demo user created: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  }

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
