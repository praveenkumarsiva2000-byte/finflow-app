import { useState } from "react";
import { User, Bell, Shield, Download, Trash2, ChevronRight, Edit3, Check, RefreshCw } from "lucide-react";
import { exportToCSV, formatCurrency } from "../utils/helpers";

export default function ProfilePage({ profile, updateProfile, expenses, incomes, clearAll }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: profile?.name || "", email: profile?.email || "" });
  const [showClear, setShowClear] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateProfile({ name: form.name.trim() || "User", email: form.email, avatar: (form.name.trim() || "U").charAt(0).toUpperCase() });
    setEditing(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    if (showClear) { clearAll(); setShowClear(false); }
    else { setShowClear(true); setTimeout(() => setShowClear(false), 4000); }
  };

  // Map UI keys to stored preference keys to keep names consistent with the backend
  const NOTIF_MAP = [
    { ui: "budgetAlert", store: "budgetAlerts", label: "Budget Alerts", sub: "Get notified when approaching limits" },
    { ui: "goalReminder", store: "goalReminders", label: "Goal Reminders", sub: "Weekly goal progress updates" },
    { ui: "weeklyReport", store: "weeklyReport", label: "Weekly Report", sub: "Summary of weekly spending" },
  ];

  const toggleNotif = (storeKey) => {
    const current = (profile && profile.preferences && profile.preferences.notifications) ? profile.preferences.notifications : {};
    const next = { ...current, [storeKey]: !Boolean(current[storeKey]) };
    // Persist under preferences as expected by the server
    const prefs = { ...(profile && profile.preferences ? profile.preferences : {}), notifications: next };
    updateProfile({ preferences: prefs });
  };

  const totalExp = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const totalInc = incomes.reduce((s, i) => s + Number(i.amount), 0);

  const stats = [
    { label: "Expenses Recorded", value: expenses.length },
    { label: "Income Recorded", value: incomes.length },
    { label: "Total Tracked", value: formatCurrency(totalExp + totalInc) },
    { label: "Net Balance", value: formatCurrency(totalInc - totalExp) },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl mx-auto">
      <div>
        <h2 className="section-title">Profile & Settings</h2>
        <p className="section-sub">Manage your account preferences</p>
      </div>

      {/* Profile Card */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl bg-electric-500/20 border border-electric-500/30 flex items-center justify-center text-2xl font-display font-black text-electric-400">
            {profile.avatar || "U"}
          </div>
          <div className="flex-1">
            {editing ? (
              <div className="space-y-2">
                <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Your name" className="input-field text-sm" />
                <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="Email (optional)" className="input-field text-sm" />
              </div>
            ) : (
              <>
                <h3 className="text-lg font-display font-bold text-white">{profile.name}</h3>
                <p className="text-sm text-white/40 font-body">{profile.email || "No email set"}</p>
              </>
            )}
          </div>
          {editing ? (
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="btn-ghost px-3 py-2">Cancel</button>
              <button onClick={handleSave} className="btn-primary px-3 py-2 flex items-center gap-1.5">{saved ? <><Check size={14} />Saved</> : <><Edit3 size={14} />Save</>}</button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="btn-ghost flex items-center gap-1.5 text-sm"><Edit3 size={14} />Edit</button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-navy-border">
          {stats.map(({ label, value }) => (
            <div key={label} className="bg-navy-soft rounded-xl p-3">
              <p className="text-xs text-white/35 font-body">{label}</p>
              <p className="text-base font-display font-bold text-white mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-card p-5 space-y-4">
        <h3 className="font-display font-bold text-white flex items-center gap-2"><Bell size={16} className="text-electric-400" />Notifications</h3>
        <div className="space-y-3">
          {NOTIF_MAP.map(({ store, label, sub }) => {
            const enabled = Boolean(profile?.preferences?.notifications?.[store]);
            return (
              <div key={store} className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-semibold text-white/80">{label}</p>
                  <p className="text-xs text-white/35 font-body mt-0.5">{sub}</p>
                </div>
                <button onClick={() => toggleNotif(store)}
                  className={`w-11 h-6 rounded-full transition-all duration-200 relative ${enabled ? "bg-electric-500" : "bg-navy-border"}`}>
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${enabled ? "left-6" : "left-1"}`} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Management */}
      <div className="glass-card p-5 space-y-3">
        <h3 className="font-display font-bold text-white flex items-center gap-2"><Shield size={16} className="text-gold" />Data Management</h3>
        <button onClick={() => exportToCSV(expenses)}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-navy-soft hover:bg-navy-border/50 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-electric-500/10 flex items-center justify-center"><Download size={14} className="text-electric-400" /></div>
            <div className="text-left">
              <p className="text-sm font-semibold text-white/80">Export Expenses</p>
              <p className="text-xs text-white/35 font-body">Download as CSV file</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-white/30" />
        </button>

        <button onClick={handleClear}
          className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${showClear ? "bg-rose/15 border border-rose/25" : "bg-navy-soft hover:bg-rose/10"}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${showClear ? "bg-rose/20" : "bg-rose/10"}`}><Trash2 size={14} className="text-rose" /></div>
            <div className="text-left">
              <p className={`text-sm font-semibold ${showClear ? "text-rose" : "text-white/80"}`}>{showClear ? "⚠️ Tap again to confirm" : "Clear All Financial Data"}</p>
              <p className="text-xs text-white/35 font-body">Removes expenses, income, budgets & goals. Keeps your account safe.</p>
            </div>
          </div>
          <ChevronRight size={16} className={showClear ? "text-rose" : "text-white/30"} />
        </button>
      </div>

      <p className="text-center text-xs text-white/20 font-body pb-2">FinFlow v1.0 · Personal Finance Manager · © 2026</p>
    </div>
  );
}
