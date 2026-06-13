const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    category: { type: String, required: [true, "Category is required"], trim: true },
      limit: { type: Number, required: [true, "Limit is required"], min: [1, "Limit must be positive"] },
      description: { type: String, default: "", trim: true },
    period: { type: String, enum: ["weekly", "monthly", "yearly"], default: "monthly" },
  },
  { timestamps: true }
);

budgetSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.userId;
    return ret;
  },
});

module.exports = mongoose.model("Budget", budgetSchema);
