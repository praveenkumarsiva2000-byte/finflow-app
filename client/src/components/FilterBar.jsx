import { useState } from "react";
import * as Icons from "lucide-react";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { CATEGORIES } from "../utils/categories";

const defaultFilters = { search: "", category: "all", dateFrom: "", dateTo: "", minAmount: "", maxAmount: "", sort: "recent" };

export default function FilterBar({ filters, onChange }) {
  const [expanded, setExpanded] = useState(false);
  const setFilter = (key, value) => onChange({ ...filters, [key]: value });
  const hasActive = filters.category !== "all" || filters.dateFrom || filters.dateTo || filters.minAmount || filters.maxAmount || filters.sort !== "recent";

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={filters.search} onChange={(e) => setFilter("search", e.target.value)}
            placeholder="Search expenses…" className="input-field pl-9 text-sm" />
        </div>
        <button onClick={() => setExpanded((v) => !v)}
          className={`btn-ghost flex items-center gap-1.5 shrink-0 ${expanded || hasActive ? "bg-electric-500/15 border-electric-500/30 text-electric-400" : ""}`}>
          <SlidersHorizontal size={14} />
          <span className="hidden sm:inline">Filters</span>
          {hasActive && <span className="w-1.5 h-1.5 rounded-full bg-electric-400" />}
          <ChevronDown size={12} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
        <select value={filters.sort} onChange={(e) => setFilter("sort", e.target.value)}
          className="input-field w-auto shrink-0 cursor-pointer text-sm">
          <option value="recent">Recent first</option>
          <option value="highest">Highest first</option>
        </select>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button onClick={() => setFilter("category", "all")}
          className={`tag-pill shrink-0 border transition-all ${filters.category === "all" ? "bg-electric-500/20 text-electric-400 border-electric-500/40" : "bg-white/5 text-white/40 border-navy-border hover:text-white/70"}`}>All</button>
        {CATEGORIES.map((cat) => {
          const Icon = Icons[cat.icon] || Icons.Package;
          return (
            <button key={cat.id} onClick={() => setFilter("category", cat.id)}
              className={`tag-pill shrink-0 border transition-all flex items-center gap-1 ${filters.category === cat.id ? `${cat.bg} ${cat.text} ${cat.border}` : "bg-white/5 text-white/40 border-navy-border hover:text-white/70"}`}>
              <Icon size={12} style={{ color: filters.category === cat.id ? undefined : "#ffffff60" }} />
              {cat.label.split(" ")[0]}
            </button>
          );
        })}
      </div>

      {expanded && (
        <div className="border-t border-navy-border pt-3 space-y-3 animate-slide-up">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-display font-semibold text-white/40 uppercase tracking-wider mb-1 block">From Date</label>
              <input type="date" value={filters.dateFrom} onChange={(e) => setFilter("dateFrom", e.target.value)} className="input-field [color-scheme:dark] text-sm" />
            </div>
            <div>
              <label className="text-xs font-display font-semibold text-white/40 uppercase tracking-wider mb-1 block">To Date</label>
              <input type="date" value={filters.dateTo} onChange={(e) => setFilter("dateTo", e.target.value)} className="input-field [color-scheme:dark] text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-display font-semibold text-white/40 uppercase tracking-wider mb-1 block">Min ₹</label>
              <input type="number" min="0" placeholder="0" value={filters.minAmount} onChange={(e) => setFilter("minAmount", e.target.value)} className="input-field text-sm" />
            </div>
            <div>
              <label className="text-xs font-display font-semibold text-white/40 uppercase tracking-wider mb-1 block">Max ₹</label>
              <input type="number" min="0" placeholder="∞" value={filters.maxAmount} onChange={(e) => setFilter("maxAmount", e.target.value)} className="input-field text-sm" />
            </div>
          </div>
          {hasActive && (
            <button onClick={() => onChange(defaultFilters)} className="flex items-center gap-1.5 text-xs text-rose font-semibold hover:opacity-80 transition-opacity">
              <X size={13} />Reset filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
