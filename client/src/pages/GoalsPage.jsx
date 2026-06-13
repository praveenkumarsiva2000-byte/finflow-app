import { useState } from "react";
import {
  Target, Palmtree, Car, Home, Heart, Smartphone,
  Plane, GraduationCap, Dumbbell, Gift, ShoppingBag,
  PiggyBank, X, Plus, Trash2, Edit3
} from "lucide-react";
import { formatCurrency } from "../utils/helpers";
import { format, differenceInDays, parseISO } from "date-fns";

const GOAL_ICONS = [
  { id: "goal", Icon: Target, label: "Goal", color: "text-electric-400", bg: "bg-electric-500/15", border: "border-electric-500/25" },
  { id: "vacation", Icon: Palmtree, label: "Vacation", color: "text-amber-400", bg: "bg-amber-500/15", border: "border-amber-500/25" },
  { id: "vehicle", Icon: Car, label: "Vehicle", color: "text-sky-400", bg: "bg-sky-500/15", border: "border-sky-500/25" },
  { id: "home", Icon: Home, label: "Home", color: "text-violet-400", bg: "bg-violet-500/15", border: "border-violet-500/25" },
  { id: "health", Icon: Heart, label: "Health", color: "text-rose-400", bg: "bg-rose-500/15", border: "border-rose-500/25" },
  { id: "gadget", Icon: Smartphone, label: "Gadget", color: "text-cyan-400", bg: "bg-cyan-500/15", border: "border-cyan-500/25" },
  { id: "travel", Icon: Plane, label: "Travel", color: "text-indigo-400", bg: "bg-indigo-500/15", border: "border-indigo-500/25" },
  { id: "education", Icon: GraduationCap, label: "Education", color: "text-teal-400", bg: "bg-teal-500/15", border: "border-teal-500/25" },
  { id: "fitness", Icon: Dumbbell, label: "Fitness", color: "text-orange-400", bg: "bg-orange-500/15", border: "border-orange-500/25" },
  { id: "gift", Icon: Gift, label: "Gift", color: "text-pink-400", bg: "bg-pink-500/15", border: "border-pink-500/25" },
  { id: "shopping", Icon: ShoppingBag, label: "Shopping", color: "text-purple-400", bg: "bg-purple-500/15", border: "border-purple-500/25" },
  { id: "savings", Icon: PiggyBank, label: "Savings", color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/25" },
];

function AddGoalModal({ onAdd, onClose, existing }) {
  const initial = existing ? { name: existing.name || "", target: existing.target || "", saved: existing.saved || "", deadline: existing.deadline || "", iconId: existing.iconId || "goal" } : { name: "", target: "", saved: "", deadline: "", iconId: "goal" };
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!form.name.trim()) { setError("Enter a goal name."); return; }
    if (!form.target || Number(form.target) <= 0) { setError("Enter a valid target amount."); return; }
    if (existing && existing.id) {
      // update existing
      onAdd(existing.id, { ...form, iconId: form.iconId || "goal", target: Number(form.target), saved: Number(form.saved) });
    } else {
      onAdd({ ...form, iconId: form.iconId || "goal", target: Number(form.target), saved: Number(form.saved) });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 pt-20 md:pt-0">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md glass-card p-6 animate-pop">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-display font-bold text-white">New Goal</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-white/50 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Icon Picker */}
          <div>
            <label className="text-xs font-display font-semibold text-white/50 uppercase tracking-wider mb-2 block">
              Pick a Category
            </label>
            <div className="grid grid-cols-4 gap-2">
              {GOAL_ICONS.map(({ id, Icon, label, color, bg, border }) => {
                const isSelected = form.iconId === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, iconId: id }))}
                    className={`flex flex-col items-center gap-2 py-3 rounded-xl border transition-all
                      ${isSelected
                        ? `${bg} ${border} scale-105`
                        : "bg-white/3 border-navy-border hover:bg-white/6"}`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg} border ${border}`}>
                      <Icon size={16} className={isSelected ? color : "text-white/35"} />
                    </div>
                    <span className={`text-[9px] font-semibold font-display ${isSelected ? color : "text-white/35"}`}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Goal Name */}
          <div>
            <label className="text-xs font-display font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">
              Goal Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setError(""); }}
              placeholder="e.g. Europe Trip, New Laptop…"
              className="input-field"
            />
          </div>

          {/* Target & Saved */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-display font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">
                Target (₹)
              </label>
              <input
                type="number"
                min="0"
                value={form.target}
                onChange={(e) => { setForm((f) => ({ ...f, target: e.target.value })); setError(""); }}
                placeholder="0"
                className="input-field"
              />
            </div>
            <div>
              <label className="text-xs font-display font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">
                Already Saved (₹)
              </label>
              <input
                type="number"
                min="0"
                value={form.saved}
                onChange={(e) => setForm((f) => ({ ...f, saved: e.target.value }))}
                placeholder="0"
                className="input-field"
              />
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="text-xs font-display font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">
              Deadline <span className="text-white/25 normal-case">(optional)</span>
            </label>
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
              min={format(new Date(), "yyyy-MM-dd")}
              className="input-field [color-scheme:dark] text-sm"
            />
          </div>

          {error && <p className="text-sm text-rose">{error}</p>}

          <div className="flex gap-3">
            <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button onClick={handleSubmit} className="btn-primary flex-1">{existing ? "Save Changes" : "Create Goal"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditProgressModal({ goal, onUpdate, onClose }) {
  const [saved, setSaved] = useState(goal.saved);

  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 pt-20 md:pt-0">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm glass-card p-6 animate-pop">
        <h2 className="text-lg font-display font-bold text-white mb-4">Update Progress</h2>

        {/* Goal identity preview */}
        {(() => {
          const meta = GOAL_ICONS.find((g) => g.id === goal.iconId) ?? GOAL_ICONS[0];
          const { Icon, color, bg, border } = meta;
          return (
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg} border ${border}`}>
                <Icon size={18} className={color} />
              </div>
              <p className="text-sm text-white/60 font-body">{goal.name}</p>
            </div>
          );
        })()}

        <div className="mb-4">
          <label className="text-xs font-display font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">
            Amount Saved (₹)
          </label>
          <input
            type="number"
            min="0"
            max={goal.target}
            value={saved}
            onChange={(e) => setSaved(e.target.value)}
            className="input-field text-xl font-display font-bold"
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button onClick={() => { onUpdate(goal.id, Number(saved)); onClose(); }} className="btn-primary flex-1">
            Update
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GoalsPage({ goals, addGoal, updateGoalProgress, deleteGoal, updateGoal }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editingFull, setEditingFull] = useState(null);

  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const totalSaved = goals.reduce((s, g) => s + g.saved, 0);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title">Financial Goals</h2>
          <p className="section-sub">Track your savings targets</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} />New Goal
        </button>
      </div>

      {/* Overall Progress */}
      {goals.length > 0 && (
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="font-display font-bold text-white">Overall Progress</p>
            <p className="text-sm font-display font-bold text-neon">
              {formatCurrency(totalSaved)} / {formatCurrency(totalTarget)}
            </p>
          </div>
          <div className="progress-bar h-3">
            <div
              className="progress-fill"
              style={{
                width: `${totalTarget > 0 ? Math.min((totalSaved / totalTarget) * 100, 100) : 0}%`,
                background: "linear-gradient(90deg, #0d87f0, #00e5a0)",
              }}
            />
          </div>
          <p className="text-xs text-white/40 mt-2 font-body">
            {totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(0) : 0}% of total goals achieved
          </p>
        </div>
      )}

      {/* Empty State */}
      {goals.length === 0 ? (
        <div className="glass-card p-12 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-navy-soft border border-navy-border flex items-center justify-center mb-4">
            <Target size={28} className="text-white/15" />
          </div>
          <p className="font-display font-semibold text-white/30">No goals yet</p>
          <p className="text-sm text-white/20 mt-1 font-body">Set financial goals to stay on track</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const pct = Math.min((goal.saved / goal.target) * 100, 100);
            const done = pct >= 100;
            const daysLeft = goal.deadline ? differenceInDays(parseISO(goal.deadline), new Date()) : null;
            const needPerDay = daysLeft && daysLeft > 0 ? (goal.target - goal.saved) / daysLeft : null;
            const meta = GOAL_ICONS.find((g) => g.id === goal.iconId) ?? GOAL_ICONS[0];
            const { Icon, color, bg, border } = meta;

            return (
              <div
                key={goal.id}
                className={`glass-card p-5 relative overflow-hidden ${done ? "border-emerald-500/30" : ""}`}
              >
                {done && <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-400/10 rounded-full blur-2xl" />}

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {/* Icon Box */}
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center border
                        ${done ? "bg-emerald-500/10 border-emerald-500/20" : `${bg} ${border}`}`}
                    >
                      <Icon size={22} className={done ? "text-emerald-400" : color} />
                    </div>
                    <div>
                      <p className="font-display font-bold text-white">{goal.name}</p>
                      {goal.deadline && (
                        <p className={`text-xs font-body ${daysLeft !== null && daysLeft < 0 ? "text-rose" : "text-white/40"}`}>
                          {daysLeft !== null && daysLeft < 0
                            ? "Deadline passed"
                            : daysLeft === 0
                              ? "Due today!"
                              : `${daysLeft} days left`}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {done && (
                      <span className="badge bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                        Done! 🎉
                      </span>
                    )}
                    <button
                      onClick={() => setEditing(goal)}
                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-electric-500/15 hover:text-electric-400 text-white/30 flex items-center justify-center transition-all"
                    >
                      <Edit3 size={12} />
                    </button>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-rose/15 hover:text-rose text-white/30 flex items-center justify-center transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50 font-body">Saved</span>
                    <span className="font-display font-bold text-white">
                      {formatCurrency(goal.saved)}{" "}
                      <span className="text-white/30 font-normal">/ {formatCurrency(goal.target)}</span>
                    </span>
                  </div>
                  <div className="progress-bar h-3">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${pct}%`,
                        background: done ? "#00e5a0" : "linear-gradient(90deg, #0d87f0, #00e5a0)",
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40 font-body">{pct.toFixed(0)}% achieved</span>
                    {needPerDay && needPerDay > 0 && (
                      <span className="text-electric-400 font-display font-semibold">
                        Save {formatCurrency(needPerDay)}/day
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => setEditingFull(goal)} className="btn-ghost">Adjust Plan</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAdd && <AddGoalModal onAdd={addGoal} onClose={() => setShowAdd(false)} />}
      {editing && <EditProgressModal goal={editing} onUpdate={updateGoalProgress} onClose={() => setEditing(null)} />}
      {editingFull && <AddGoalModal existing={editingFull} onAdd={(id, data) => { updateGoal(id, data); setEditingFull(null); }} onClose={() => setEditingFull(null)} />}
    </div>
  );
}
