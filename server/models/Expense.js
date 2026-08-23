const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: [true, "Amount is required"], min: [0.01, "Amount must be positive"] },
    category: { type: String, required: [true, "Category is required"], trim: true },
    date: { type: String, required: [true, "Date is required"] },
    note: { type: String, default: "", trim: true },
    isRecurring: { type: Boolean, default: false },
    frequency: { type: String, enum: ["daily", "weekly", "monthly", "yearly"], default: "monthly" },
    recurringSourceId: { type: mongoose.Schema.Types.ObjectId, ref: "Expense", default: null },
    recurringPeriodKey: { type: String, default: null },
  },
  { timestamps: true }
);

expenseSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.userId;
    return ret;
  },
});

module.exports = mongoose.model("Expense", expenseSchema);
