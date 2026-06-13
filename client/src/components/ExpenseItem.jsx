import { useState } from "react";
import * as Icons from "lucide-react";
import { Trash2, RefreshCw, Edit3, Check } from "lucide-react";
import { getCategoryById } from "../utils/categories";
import { formatCurrency } from "../utils/helpers";

export default function ExpenseItem({ expense, onDelete, updateExpense }) {
  const [confirming, setConfirming] = useState(false);
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState({ amount: expense.amount, note: expense.note });
  const cat = getCategoryById(expense.category);
  const Icon = Icons[cat.icon] || Icons.Package;

  const handleDelete = () => {
    if (confirming) { onDelete(expense.id); }
    else { setConfirming(true); setTimeout(() => setConfirming(false), 2500); }
  };

  const handleSave = async () => {
    await updateExpense(expense.id, { amount: Number(local.amount), note: local.note });
    setEditing(false);
  };

  return (
    <div className="group flex flex-col gap-2 px-4 py-3 hover:bg-white/3 transition-all duration-200">
      <div className="flex items-start gap-3 w-full">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cat.bg} border ${cat.border}`}>
          <Icon size={18} style={{ color: cat.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-white truncate">{expense.note || cat.label}</p>
            {expense.isRecurring && <RefreshCw size={11} className="text-electric-400 shrink-0" title="Recurring" />}
            <span className={`tag-pill hidden sm:inline-flex ${cat.bg} ${cat.text} border ${cat.border}`}>{cat.label.split(" ")[0]}</span>
          </div>
          <p className="text-xs text-white/35 mt-0.5 font-body">{expense.note ? cat.label : ""}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right shrink-0">
            <p className="text-sm font-display font-bold text-white">{formatCurrency(expense.amount)}</p>
          </div>
          <div className="ml-auto flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
            <button onClick={() => setEditing((s) => !s)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 flex items-center justify-center">
              <Edit3 size={13} />
            </button>
            <button onClick={handleDelete}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
              ${confirming ? "bg-rose/20 text-rose border border-rose/40" : "bg-white/5 text-white/30 hover:bg-rose/15 hover:text-rose"}`}
              title={confirming ? "Tap again to confirm" : "Delete"}>
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>

      {editing && (
        <div className="w-full mt-2 flex items-center gap-2">
          <input type="number" min="0" value={local.amount}
            onChange={(e) => setLocal((l) => ({ ...l, amount: e.target.value }))}
            className="input-field flex-1" />
          <input type="text" value={local.note} onChange={(e) => setLocal((l) => ({ ...l, note: e.target.value }))} placeholder="Note" className="input-field flex-2" />
          <button onClick={handleSave} className="btn-primary">Save</button>
          <button onClick={() => { setEditing(false); setLocal({ amount: expense.amount, note: expense.note }); }} className="btn-ghost">Cancel</button>
        </div>
      )}
    </div>
  );
}
