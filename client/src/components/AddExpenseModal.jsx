import { useState } from "react";
import * as Icons from "lucide-react";
import { X, Plus, IndianRupee, RefreshCw, Trash2, Copy, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { CATEGORIES } from "../utils/categories";
import { format } from "date-fns";

const today = format(new Date(), "yyyy-MM-dd");
const newEntry = () => ({ id: Date.now() + Math.random(), amount: "", category: "food", date: today, note: "", isRecurring: false });

function EntryRow({ entry, idx, total, onChange, onRemove, onDuplicate }) {
  const [open, setOpen] = useState(idx === 0);

  const cat = CATEGORIES.find((c) => c.id === entry.category) || CATEGORIES[0];
  const CatIcon = Icons[cat.icon] || Icons.Package;

  return (
    <div className="border border-navy-border rounded-2xl overflow-hidden transition-all">
      {/* Row header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-navy-soft hover:bg-white/3 transition-all"
      >
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${cat.bg} border ${cat.border}`}>
          <CatIcon size={15} style={{ color: cat.color }} />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-display font-semibold text-white">
            {entry.amount ? `₹${Number(entry.amount).toLocaleString("en-IN")}` : <span className="text-white/30">Amount</span>}
            {entry.note && <span className="text-white/40 font-body font-normal text-xs ml-2">· {entry.note}</span>}
          </p>
          <p className="text-[11px] text-white/30 font-body">{cat.label} · {entry.date || today}</p>
        </div>
        <div className="flex items-center gap-1.5">
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
                className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 text-white/25 hover:text-white/60 flex items-center justify-center transition-all"
              >
                <Copy size={11} />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                className="w-6 h-6 rounded-lg bg-white/5 hover:bg-rose/15 text-white/25 hover:text-rose flex items-center justify-center transition-all"
              >
                <Trash2 size={11} />
              </button>
            </>
          )}
          {open ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}
        </div>
      </button>

      {/* Expanded content */}
      {open && (
        <div className="px-4 pb-4 pt-3 space-y-3 bg-navy-card/50 border-t border-navy-border animate-fade-in">
          {/* Amount */}
          <div>
            <label className="text-[10px] font-display font-semibold text-white/40 uppercase tracking-wider mb-1 block">Amount (₹)</label>
            <div className="relative">
              <IndianRupee size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="number" min="0" step="1" value={entry.amount}
                onChange={(e) => onChange({ amount: e.target.value })}
                placeholder="0"
                className="input-field pl-9 text-lg font-display font-bold py-2.5"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-[10px] font-display font-semibold text-white/40 uppercase tracking-wider mb-1.5 block">Category</label>
            <div className="grid grid-cols-5 gap-1.5">
              {CATEGORIES.map((c) => {
                const Icon = Icons[c.icon] || Icons.Package;
                return (
                  <button
                    key={c.id} type="button"
                    onClick={() => onChange({ category: c.id })}
                    className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border text-xs font-semibold font-display transition-all duration-150
                      ${entry.category === c.id ? `${c.bg} ${c.border} ${c.text} scale-105` : "bg-white/3 border-navy-border text-white/40 hover:bg-white/6"}`}
                  >
                    <Icon size={15} style={{ color: entry.category === c.id ? c.color : "#ffffff60" }} />
                    <span className="text-[8px] leading-tight text-center">{c.label.split(" ")[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date + Note */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] font-display font-semibold text-white/40 uppercase tracking-wider mb-1 block">Date</label>
              <input
                type="date" value={entry.date}
                onChange={(e) => onChange({ date: e.target.value })}
                max={today}
                className="input-field [color-scheme:dark] text-sm py-2.5"
              />
            </div>
            <div>
              <label className="text-[10px] font-display font-semibold text-white/40 uppercase tracking-wider mb-1 block">Note</label>
              <input
                type="text" value={entry.note}
                onChange={(e) => onChange({ note: e.target.value })}
                placeholder="Optional"
                className="input-field text-sm py-2.5"
              />
            </div>
          </div>

          {/* Recurring */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onChange({ isRecurring: !entry.isRecurring })}
              className={`w-9 h-5 rounded-full transition-all duration-200 relative shrink-0 ${entry.isRecurring ? "bg-electric-500" : "bg-white/10"}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${entry.isRecurring ? "left-4.5" : "left-0.5"}`} />
            </button>
            <div className="flex items-center gap-1.5">
              <RefreshCw size={12} className={entry.isRecurring ? "text-electric-400" : "text-white/30"} />
              <span className="text-xs font-display font-semibold text-white/50">Recurring</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AddExpenseModal({ onAdd, onClose }) {
  const [entries, setEntries] = useState([newEntry()]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const update = (id, changes) => {
    setEntries((es) => es.map((e) => e.id === id ? { ...e, ...changes } : e));
    setError("");
  };

  const addRow = () => setEntries((es) => [...es, newEntry()]);

  const removeRow = (id) => setEntries((es) => es.filter((e) => e.id !== id));

  const duplicateRow = (id) => {
    setEntries((es) => {
      const idx = es.findIndex((e) => e.id === id);
      const copy = { ...es[idx], id: Date.now() + Math.random() };
      const next = [...es];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  };

  const total = entries.reduce((s, e) => s + (Number(e.amount) || 0), 0);

  const handleSubmit = () => {
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      if (!e.amount || isNaN(Number(e.amount)) || Number(e.amount) <= 0) {
        setError(`Entry ${i + 1}: Please enter a valid amount.`);
        return;
      }
      if (!e.date) {
        setError(`Entry ${i + 1}: Please select a date.`);
        return;
      }
    }
    entries.forEach((e) => onAdd(e));
    setSuccess(true);
    setTimeout(() => { setSuccess(false); onClose(); }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 pt-20 md:pt-0">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-lg glass-card animate-pop flex flex-col max-h-[90vh] md:mt-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-navy-border shrink-0">
          <div>
            <h2 className="text-xl font-display font-bold text-white">Add Expenses</h2>
            <p className="text-xs text-white/35 font-body mt-0.5">
              {entries.length === 1 ? "1 entry" : `${entries.length} entries`}
              {total > 0 && <span className="ml-2 text-electric-400 font-display font-semibold">· ₹{total.toLocaleString("en-IN")}</span>}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white/50 hover:text-white">
            <X size={16} />
          </button>
        </div>

        {/* Scrollable entries */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2.5">
          {entries.map((entry, idx) => (
            <EntryRow
              key={entry.id}
              entry={entry}
              idx={idx}
              total={entries.length}
              onChange={(changes) => update(entry.id, changes)}
              onRemove={() => removeRow(entry.id)}
              onDuplicate={() => duplicateRow(entry.id)}
            />
          ))}

          {/* Add more */}
          <button
            type="button" onClick={addRow}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-navy-border hover:border-electric-500/40 hover:bg-electric-500/5 text-white/30 hover:text-electric-400 font-display font-semibold text-sm transition-all duration-200"
          >
            <Plus size={16} /> Add Another Expense
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-navy-border shrink-0 space-y-3">
          {/* Total summary when multiple */}
          {entries.length > 1 && total > 0 && (
            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-electric-500/10 border border-electric-500/20">
              <span className="text-xs font-display font-semibold text-white/60">Total for {entries.length} entries</span>
              <span className="text-sm font-display font-black text-electric-400">₹{total.toLocaleString("en-IN")}</span>
            </div>
          )}

          {error && <p className="text-sm text-rose font-body animate-fade-in">{error}</p>}

          <div className="flex gap-3">
            <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button
              onClick={handleSubmit}
              className={`btn-primary flex-1 flex items-center justify-center gap-2 transition-all ${success ? "bg-emerald-500 scale-95" : ""}`}
            >
              {success
                ? <><CheckCircle2 size={16} /> Saved!</>
                : <><Plus size={16} />{entries.length > 1 ? `Add ${entries.length} Expenses` : "Add Expense"}</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
