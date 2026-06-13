import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, Area, AreaChart } from "recharts";
import * as Icons from "lucide-react";
import { CATEGORIES, getCategoryById } from "../utils/categories";
import { getTotalByCategory, getMonthlyTrend, getDailyTrend, formatCurrency } from "../utils/helpers";
import { PieChart as PieIcon, BarChart2, TrendingUp } from "lucide-react";

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    const cat = getCategoryById(payload[0].name);
    const Icon = Icons[cat.icon] || Icons.Package;
    return (
      <div className="glass-card px-3 py-2 text-xs border-navy-border">
        <p className="font-display font-bold text-white flex items-center gap-2">
          <Icon size={14} style={{ color: cat.color }} />{cat.label}
        </p>
        <p className="font-semibold mt-0.5" style={{ color: cat.color }}>{formatCurrency(payload[0].value)}</p>
        <p className="text-white/40">{payload[0].payload.percent}% of total</p>
      </div>
    );
  }
  return null;
};

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card px-3 py-2 text-xs">
        <p className="font-display font-bold text-white/70">{label}</p>
        <p className="text-electric-400 font-semibold">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

export default function Charts({ expenses }) {
  const [chartType, setChartType] = useState("area");

  const categoryTotals = getTotalByCategory(expenses);
  const total = Object.values(categoryTotals).reduce((s, v) => s + v, 0);
  const pieData = CATEGORIES
    .filter((cat) => categoryTotals[cat.id] > 0)
    .map((cat) => ({ name: cat.id, value: categoryTotals[cat.id], color: cat.color, percent: total > 0 ? Math.round((categoryTotals[cat.id] / total) * 100) : 0 }));
  const barData = getDailyTrend(expenses, 7);
  const areaData = getMonthlyTrend(expenses, 6);

  if (expenses.length === 0) {
    return (
      <div className="glass-card p-6 flex flex-col items-center justify-center min-h-48 text-center">
        <BarChart2 size={32} className="text-white/10 mb-3" />
        <p className="font-display font-semibold text-white/30">No data to visualize</p>
        <p className="text-xs text-white/20 mt-1">Add expenses to see charts</p>
      </div>
    );
  }

  const chartBtns = [
    { id: "area", icon: TrendingUp, label: "Trend" },
    { id: "pie", icon: PieIcon, label: "Category" },
    { id: "bar", icon: BarChart2, label: "Daily" },
  ];

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-white">Spending Analysis</h3>
        <div className="flex gap-1 bg-navy-soft p-1 rounded-xl">
          {chartBtns.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setChartType(id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-display font-semibold transition-all ${chartType === id ? "bg-electric-500 text-white" : "text-white/30 hover:text-white/60"}`}>
              <Icon size={12} />{label}
            </button>
          ))}
        </div>
      </div>

      {chartType === "area" && (
        <div className="animate-fade-in">
          <p className="text-xs text-white/30 mb-3 font-display">6-Month Trend</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={areaData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d87f0" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0d87f0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomBarTooltip />} cursor={{ stroke: "rgba(13,135,240,0.2)" }} />
              <Area type="monotone" dataKey="total" stroke="#0d87f0" strokeWidth={2} fill="url(#areaGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {chartType === "pie" && pieData.length > 0 && (
        <div className="animate-fade-in">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                {pieData.map((entry) => <Cell key={entry.name} fill={entry.color} stroke="transparent" />)}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {pieData.map((entry) => {
              const cat = getCategoryById(entry.name);
              return (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: cat.color }} />
                  <span className="text-xs text-white/60 truncate">{cat.label}</span>
                  <span className="text-xs font-semibold text-white/80 ml-auto shrink-0">{entry.percent}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {chartType === "bar" && (
        <div className="animate-fade-in">
          <p className="text-xs text-white/30 mb-3 font-display">Daily Spending (Last 7 days)</p>
          {barData.length === 0
            ? <p className="text-center text-white/30 text-sm py-8">Not enough data</p>
            : <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="total" radius={[6,6,0,0]} maxBarSize={48}>
                  {barData.map((_, i) => <Cell key={i} fill={i === barData.length - 1 ? "#00e5a0" : "#0d87f0"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          }
        </div>
      )}
    </div>
  );
}
