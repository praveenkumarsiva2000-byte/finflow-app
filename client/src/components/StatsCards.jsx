import { TrendingUp, TrendingDown, Wallet, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatCurrency } from "../utils/helpers";
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO, subMonths } from "date-fns";

export default function StatsCards({ expenses, incomes = [] }) {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const prevStart = startOfMonth(subMonths(now, 1));
  const prevEnd = endOfMonth(subMonths(now, 1));

  const inRange = (e, s, end) => { try { return isWithinInterval(parseISO(e.date), { start: s, end }); } catch { return false; } };
  const thisMonthExp = expenses.filter((e) => inRange(e, monthStart, monthEnd));
  const prevMonthExp = expenses.filter((e) => inRange(e, prevStart, prevEnd));
  const thisMonthInc = incomes.filter((i) => inRange(i, monthStart, monthEnd));

  const totalAll = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const totalMonth = thisMonthExp.reduce((s, e) => s + Number(e.amount), 0);
  const prevMonth = prevMonthExp.reduce((s, e) => s + Number(e.amount), 0);
  const totalIncome = thisMonthInc.reduce((s, i) => s + Number(i.amount), 0);
  const netSavings = totalIncome - totalMonth;
  const monthChange = prevMonth > 0 ? ((totalMonth - prevMonth) / prevMonth) * 100 : 0;

  const stats = [
    {
      label: "Total Spent", value: formatCurrency(totalAll), sub: `${expenses.length} transactions`,
      icon: Wallet, gradient: "from-electric-500/20 to-electric-500/5", accent: "text-electric-400", dot: "bg-electric-500",
    },
    {
      label: "This Month", value: formatCurrency(totalMonth), sub: monthChange !== 0 ? `${monthChange > 0 ? "+" : ""}${monthChange.toFixed(1)}% vs last month` : format(now, "MMMM yyyy"),
      icon: monthChange > 0 ? TrendingUp : TrendingDown,
      gradient: "from-sky-500/20 to-sky-500/5", accent: "text-sky-400", dot: "bg-sky-500",
      trend: monthChange, trendIcon: monthChange > 0 ? ArrowUpRight : ArrowDownRight,
    },
    {
      label: "Net Savings", value: formatCurrency(Math.abs(netSavings)), sub: netSavings >= 0 ? "Positive balance 🎉" : "Overspent this month",
      icon: TrendingUp, gradient: netSavings >= 0 ? "from-neon/20 to-neon/5" : "from-rose-500/20 to-rose-500/5",
      accent: netSavings >= 0 ? "text-emerald-400" : "text-rose-400", dot: netSavings >= 0 ? "bg-emerald-400" : "bg-rose-400",
    },
    {
      label: "Monthly Income", value: formatCurrency(totalIncome), sub: `${thisMonthInc.length} income sources`,
      icon: ArrowUpRight, gradient: "from-gold/20 to-gold/5", accent: "text-yellow-400", dot: "bg-yellow-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger">
      {stats.map(({ label, value, sub, icon: Icon, gradient, accent, dot, trend, trendIcon: TrendIcon }) => (
        <div key={label} className="stat-card animate-slide-up relative overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-60 rounded-2xl`} />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-xl ${dot}/15 flex items-center justify-center`}>
                <Icon size={17} className={accent} />
              </div>
              {trend !== undefined && (
                <span className={`text-xs font-display font-bold flex items-center gap-0.5 ${trend > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                  {TrendIcon && <TrendIcon size={12} />}
                  {Math.abs(trend).toFixed(0)}%
                </span>
              )}
            </div>
            <div className="mt-3">
              <p className="text-xs font-display font-semibold text-white/40 uppercase tracking-wider">{label}</p>
              <p className="text-xl font-display font-black text-white mt-1 leading-tight">{value}</p>
              <p className="text-xs text-white/30 mt-1 truncate font-body">{sub}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
