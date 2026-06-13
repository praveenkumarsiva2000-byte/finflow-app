import * as Icons from "lucide-react";
import { CATEGORIES } from "../utils/categories";
import { getTotalByCategory, formatCurrency } from "../utils/helpers";

export default function CategoryBreakdown({ expenses }) {
  const totals = getTotalByCategory(expenses);
  const grand = Object.values(totals).reduce((s, v) => s + v, 0);
  const sorted = CATEGORIES.filter((c) => totals[c.id] > 0).sort((a, b) => (totals[b.id] || 0) - (totals[a.id] || 0));

  if (sorted.length === 0) {
    return (
      <div className="glass-card p-5">
        <h3 className="font-display font-bold text-white mb-4">By Category</h3>
        <p className="text-sm text-white/30 text-center py-6">No data yet</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-5">
      <h3 className="font-display font-bold text-white mb-4">By Category</h3>
      <div className="space-y-3">
        {sorted.map((cat) => {
          const Icon = Icons[cat.icon] || Icons.Package;
          const amt = totals[cat.id] || 0;
          const pct = grand > 0 ? (amt / grand) * 100 : 0;
          return (
            <div key={cat.id} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon size={15} style={{ color: cat.color }} />
                  <span className="text-sm font-semibold text-white/80">{cat.label}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-display font-bold text-white">{formatCurrency(amt)}</span>
                  <span className="text-xs text-white/30 ml-2">{Math.round(pct)}%</span>
                </div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${pct}%`, background: cat.color }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
