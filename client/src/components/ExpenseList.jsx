import { Receipt } from "lucide-react";
import { groupExpensesByDate } from "../utils/helpers";
import ExpenseItem from "./ExpenseItem";
import { useExpenses } from "../hooks/useExpenses";

export default function ExpenseList({ expenses, onDelete }) {
  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-navy-soft border border-navy-border flex items-center justify-center mb-4">
          <Receipt size={28} className="text-white/15" />
        </div>
        <p className="font-display font-semibold text-white/30">No expenses found</p>
        <p className="text-sm text-white/20 mt-1 font-body">Add your first expense to get started</p>
      </div>
    );
  }
  const { updateExpense } = useExpenses();
  const grouped = groupExpensesByDate(expenses);
  return (
    <div className="space-y-5 stagger">
      {Object.entries(grouped).map(([dateLabel, items]) => (
        <div key={dateLabel} className="animate-slide-up">
          <div className="flex items-center gap-3 mb-2 px-1">
            <p className="text-xs font-display font-bold text-white/35 uppercase tracking-widest">{dateLabel}</p>
            <div className="flex-1 h-px bg-navy-border" />
            <p className="text-xs font-semibold text-white/25">{items.length} {items.length === 1 ? "entry" : "entries"}</p>
          </div>
          <div className="glass-card overflow-hidden divide-y divide-navy-border/60">
            {items.map((exp) => <ExpenseItem key={exp.id} expense={exp} onDelete={onDelete} updateExpense={updateExpense} />)}
          </div>
        </div>
      ))}
    </div>
  );
}
