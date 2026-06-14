import { useState } from "react";
import * as Icons from "lucide-react";
import { Plus, Trash2, TrendingUp, IndianRupee, Edit3 } from "lucide-react";
import { INCOME_CATEGORIES, getIncomeCategoryById } from "../utils/categories";
import { formatCurrency, formatDate } from "../utils/helpers";
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";

function AddIncomeModal({ onAdd, onClose }) {
  const [form, setForm] = useState({ amount: "", source: "salary", date: format(new Date(), "yyyy-MM-dd"), note: "" });
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!form.amount || Number(form.amount) <= 0) { setError("Enter a valid amount."); return; }
    // include `category` so server and UI use the selected income source for display
    onAdd({ ...form, category: form.source }); onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-start md:items-center justify-center p-4 pt-20 md:pt-0">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-md glass-card p-6 animate-pop z-50">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-display font-bold text-white">Add Income</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-white/50"><Icons.X size={16} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-display font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">Amount (₹)</label>
            <div className="relative">
              <IndianRupee size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input type="number" min="0" value={form.amount} onChange={(e) => { setForm((f) => ({ ...f, amount: e.target.value })); setError(""); }}
                placeholder="0" className="input-field pl-9 text-xl font-display font-bold" />
            </div>
          </div>
          <div>
            <label className="text-xs font-display font-semibold text-white/50 uppercase tracking-wider mb-2 block">Source</label>
            <div className="grid grid-cols-3 gap-2">
              {INCOME_CATEGORIES.map((cat) => {
                const Icon = Icons[cat.icon] || Icons.Package;
                return (
                  <button key={cat.id} type="button" onClick={() => setForm((f) => ({ ...f, source: cat.id }))}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-semibold transition-all
                      ${form.source === cat.id ? "bg-neon/15 border-neon/40 text-neon scale-105" : "bg-white/3 border-navy-border text-white/40 hover:bg-white/6"}`}>
                    <Icon size={18} style={{ color: form.source === cat.id ? cat.color : "#ffffff60" }} />
                    <span className="text-[9px]">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-display font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="input-field [color-scheme:dark] text-sm" />
            </div>
            <div>
              <label className="text-xs font-display font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">Note</label>
              <input type="text" value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder="Optional" className="input-field text-sm" />
            </div>
          </div>
          {error && <p className="text-sm text-rose">{error}</p>}
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button onClick={handleSubmit} className="btn-neon flex-1 flex items-center justify-center gap-2"><Plus size={16} />Add Income</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function IncomePage({ incomes, addIncome, deleteIncome, updateIncome, expenses }) {
  const [showModal, setShowModal] = useState(false);

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const inRange = (i) => { try { return isWithinInterval(parseISO(i.date), { start: monthStart, end: monthEnd }); } catch { return false; } };

  const thisMonthIncome = incomes.filter(inRange);
  const totalIncome = incomes.reduce((s, i) => s + Number(i.amount), 0);
  const monthIncome = thisMonthIncome.reduce((s, i) => s + Number(i.amount), 0);
  const monthExpenses = expenses.filter(inRange).reduce((s, e) => s + Number(e.amount), 0);
  const netSavings = monthIncome - monthExpenses;

  const byCategory = {};
  incomes.forEach((i) => { byCategory[i.category] = (byCategory[i.category] || 0) + Number(i.amount); });

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title">Income</h2>
          <p className="section-sub">Track your earnings</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-neon flex items-center gap-2"><Plus size={16} />Add Income</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { label: "Total Income", value: formatCurrency(totalIncome), sub: `${incomes.length} entries`, icon: TrendingUp, color: "text-neon", bg: "bg-neon/10" },
          { label: "This Month", value: formatCurrency(monthIncome), sub: format(now, "MMMM yyyy"), icon: Icons.Calendar, color: "text-electric-400", bg: "bg-electric-500/10" },
          { label: "Net Savings", value: formatCurrency(Math.abs(netSavings)), sub: netSavings >= 0 ? "Positive 🎉" : "Deficit", icon: netSavings >= 0 ? Icons.ArrowUpRight : Icons.ArrowDownRight, color: netSavings >= 0 ? "text-emerald-400" : "text-rose", bg: netSavings >= 0 ? "bg-emerald-500/10" : "bg-rose/10" },
        ].map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}><Icon size={17} className={color} /></div>
            <div>
              <p className="text-xs font-display font-semibold text-white/40 uppercase tracking-wider">{label}</p>
              <p className="text-xl font-display font-black text-white mt-0.5">{value}</p>
              <p className="text-xs text-white/30 mt-0.5 font-body">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {incomes.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="font-display font-bold text-white mb-4">By Source</h3>
          <div className="space-y-3">
            {INCOME_CATEGORIES.filter((c) => byCategory[c.id]).map((cat) => {
              const Icon = Icons[cat.icon] || Icons.Package;
              const amt = byCategory[cat.id] || 0;
              const pct = totalIncome > 0 ? (amt / totalIncome) * 100 : 0;
              return (
                <div key={cat.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><Icon size={15} style={{ color: cat.color }} /><span className="text-sm font-semibold text-white/80">{cat.label}</span></div>
                    <div className="text-right"><span className="text-sm font-display font-bold text-white">{formatCurrency(amt)}</span><span className="text-xs text-white/30 ml-2">{Math.round(pct)}%</span></div>
                  </div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%`, background: cat.color }} /></div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {incomes.length === 0 ? (
        <div className="glass-card p-12 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-navy-soft border border-navy-border flex items-center justify-center mb-4">
            <TrendingUp size={28} className="text-white/15" />
          </div>
          <p className="font-display font-semibold text-white/30">No income recorded</p>
          <p className="text-sm text-white/20 mt-1 font-body">Start tracking your income sources</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-3 border-b border-navy-border">
            <h3 className="font-display font-bold text-white">All Income</h3>
          </div>
          <div className="divide-y divide-navy-border/60">
            {[...incomes].sort((a, b) => new Date(b.date) - new Date(a.date)).map((income) => {
              const cat = getIncomeCategoryById(income.category);
              const Icon = Icons[cat.icon] || Icons.Package;
              return (
                <IncomeRow key={income.id} income={income} Icon={Icon} cat={cat} deleteIncome={deleteIncome} updateIncome={updateIncome} />
              );
            })}
          </div>
        </div>
      )}

      {showModal && <AddIncomeModal onAdd={addIncome} onClose={() => setShowModal(false)} />}
    </div>
  );
}

function IncomeRow({ income, Icon, cat, deleteIncome, updateIncome }) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState({ amount: income.amount, note: income.note });

  const handleSave = async () => {
    await updateIncome(income.id, { amount: Number(local.amount), note: local.note });
    setEditing(false);
  };

  return (
    <div className="group">
      <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/3 transition-all">
        <div className="w-10 h-10 rounded-xl bg-neon/10 border border-neon/20 flex items-center justify-center shrink-0">
          <Icon size={17} style={{ color: cat.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">{income.note || cat.label}</p>
          <p className="text-xs text-white/35 font-body mt-0.5">{formatDate(income.date)} · {cat.label}</p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-display font-bold text-neon">+{formatCurrency(income.amount)}</p>
          <div className="ml-2 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2">
            <button onClick={() => setEditing((s) => !s)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 flex items-center justify-center"><Edit3 size={12} /></button>
            <button onClick={() => deleteIncome(income.id)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-rose/15 hover:text-rose text-white/30 flex items-center justify-center"><Trash2 size={12} /></button>
          </div>
        </div>
      </div>
      {editing && (
        <div className="px-5 pb-3 flex items-center gap-2">
          <input type="number" value={local.amount} onChange={(e) => setLocal((l) => ({ ...l, amount: e.target.value }))} className="input-field" />
          <input type="text" value={local.note} onChange={(e) => setLocal((l) => ({ ...l, note: e.target.value }))} placeholder="Note" className="input-field flex-1" />
          <button onClick={handleSave} className="btn-primary">Save</button>
          <button onClick={() => { setEditing(false); setLocal({ amount: income.amount, note: income.note }); }} className="btn-ghost">Cancel</button>
        </div>
      )}
    </div>
  );
}