import { useState } from "react";
import * as Icons from "lucide-react";
import { Plus, Trash2, AlertTriangle, CheckCircle, Target } from "lucide-react";
import { CATEGORIES, getCategoryById } from "../utils/categories";
import { formatCurrency, getThisMonthExpenses, getTotalByCategory } from "../utils/helpers";
import { format } from "date-fns";

function AddBudgetModal({ onAdd, onClose, existing }) {
  const [form, setForm] = useState({ category: "food", limit: "", period: "monthly", description: "" });
  const [error, setError] = useState("");
  const existingIds = existing.map((b) => b.category);

  const handleSubmit = () => {
    if (!form.limit || Number(form.limit) <= 0) { setError("Enter a valid budget limit."); return; }
    onAdd(form); onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 pt-20 md:pt-0">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md glass-card p-6 animate-pop">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-display font-bold text-white">Set Budget</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/50"><Icons.X size={16} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-display font-semibold text-white/50 uppercase tracking-wider mb-2 block">Category</label>
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
              {CATEGORIES.map((cat) => {
                const Icon = Icons[cat.icon] || Icons.Package;
                const hasExisting = existingIds.includes(cat.id) && form.category !== cat.id;
                return (
                  <button key={cat.id} type="button" onClick={() => setForm((f) => ({ ...f, category: cat.id }))}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-semibold transition-all
                      ${form.category === cat.id ? `${cat.bg} ${cat.border} ${cat.text} scale-105` : "bg-white/3 border-navy-border text-white/40 hover:bg-white/6"}
                      ${hasExisting ? "opacity-50" : ""}`}>
                    <Icon size={18} style={{ color: form.category === cat.id ? cat.color : "#ffffff60" }} />
                    <span className="text-[9px] text-center leading-tight">{cat.label.split(" ")[0]}</span>
                    {hasExisting && <span className="text-[8px] text-electric-400">Set</span>}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="text-xs font-display font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">Budget Limit (₹)</label>
            <input type="number" min="0" value={form.limit} onChange={(e) => { setForm((f) => ({ ...f, limit: e.target.value })); setError(""); }}
              placeholder="e.g. 5000" className="input-field text-lg font-display font-bold" />
          </div>
          <div>
            <label className="text-xs font-display font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">Description</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Optional: describe this budget (e.g., groceries for family)" className="input-field text-sm h-24 resize-none" />
          </div>
          <div>
            <label className="text-xs font-display font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">Period</label>
            <select value={form.period} onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))} className="input-field text-sm">
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          {error && <p className="text-sm text-rose">{error}</p>}
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button onClick={handleSubmit} className="btn-primary flex-1">Set Budget</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BudgetPage({ budgets, addBudget, deleteBudget, expenses }) {
  const [showModal, setShowModal] = useState(false);
  const thisMonth = getThisMonthExpenses(expenses);
  const spentByCategory = getTotalByCategory(thisMonth);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title">Budgets</h2>
          <p className="section-sub">Track your spending limits — {format(new Date(), "MMMM yyyy")}</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} />Set Budget
        </button>
      </div>

      {budgets.length === 0 ? (
        <div className="glass-card p-12 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-electric-500/10 border border-electric-500/20 flex items-center justify-center mb-4">
            <Target size={28} className="text-electric-400" />
          </div>
          <p className="font-display font-semibold text-white/40 text-lg">No budgets set</p>
          <p className="text-sm text-white/25 mt-2 font-body">Create budgets to track your spending limits</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((budget) => {
            const cat = getCategoryById(budget.category);
            const Icon = Icons[cat.icon] || Icons.Package;
            const spent = spentByCategory[budget.category] || 0;
            const pct = Math.min((spent / budget.limit) * 100, 100);
            const isOver = spent > budget.limit;
            const isNear = pct >= 80 && !isOver;

            return (
              <div key={budget.id} className={`glass-card p-5 relative overflow-hidden ${isOver ? "border-rose/30" : isNear ? "border-yellow-500/30" : ""}`}>
                <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-10 pointer-events-none ${isOver ? "bg-rose" : "bg-electric-500"}`} />
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl ${cat.bg} border ${cat.border} flex items-center justify-center`}>
                      <Icon size={20} style={{ color: cat.color }} />
                    </div>
                    <div>
                      <p className="font-display font-bold text-white">{cat.label}</p>
                      <p className="text-xs text-white/40 font-body capitalize">{budget.period}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOver && <span className="badge bg-rose/15 text-rose border border-rose/25">Over!</span>}
                    {isNear && <span className="badge bg-yellow-500/15 text-yellow-400 border border-yellow-500/25">Near limit</span>}
                    <button onClick={() => deleteBudget(budget.id)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-rose/15 hover:text-rose text-white/30 flex items-center justify-center transition-all">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {budget.description && <p className="text-sm text-white/40 mb-1">{budget.description}</p>}
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50 font-body">Spent</span>
                    <span className={`font-display font-bold ${isOver ? "text-rose" : "text-white"}`}>{formatCurrency(spent)}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill transition-all duration-700"
                      style={{ width: `${pct}%`, background: isOver ? "#ff4f7b" : isNear ? "#f5c842" : cat.color }} />
                  </div>
                  <div className="flex justify-between text-xs text-white/40">
                    <span className="font-body">{pct.toFixed(0)}% used</span>
                    <span className="font-body">Limit: {formatCurrency(budget.limit)}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs font-display font-semibold pt-1 ${isOver ? "text-rose" : "text-emerald-400"}`}>
                    {isOver ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                    {isOver ? `Over by ${formatCurrency(spent - budget.limit)}` : `${formatCurrency(budget.limit - spent)} remaining`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && <AddBudgetModal onAdd={addBudget} onClose={() => setShowModal(false)} existing={budgets} />}
    </div>
  );
}
