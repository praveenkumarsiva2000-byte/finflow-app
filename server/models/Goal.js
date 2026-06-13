const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: [true, "Goal name is required"], trim: true },
    target: { type: Number, required: [true, "Target amount is required"], min: [1, "Target must be positive"] },
    saved: { type: Number, default: 0, min: 0 },
  deadline: { type: String, default: "" },
  iconId: { type: String, default: "goal" },
  emoji: { type: String, default: "🎯" },
  },
  { timestamps: true }
);

goalSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.userId;
    return ret;
  },
});

module.exports = mongoose.model("Goal", goalSchema);
