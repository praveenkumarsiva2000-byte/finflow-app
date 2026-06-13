const mongoose = require("mongoose");

const incomeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: [true, "Amount is required"], min: [0.01, "Amount must be positive"] },
    source: { type: String, required: [true, "Source is required"], trim: true },
    category: { type: String, default: "salary", trim: true },
    date: { type: String, required: [true, "Date is required"] },
    note: { type: String, default: "", trim: true },
    isRecurring: { type: Boolean, default: false },
  },
  { timestamps: true }
);

incomeSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.userId;
    return ret;
  },
});

module.exports = mongoose.model("Income", incomeSchema);
