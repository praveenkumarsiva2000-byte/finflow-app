import { format, isToday, isYesterday, parseISO, startOfMonth, endOfMonth, isWithinInterval, subMonths } from "date-fns";

export const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount || 0);

export const formatDate = (dateStr) => {
  try {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "dd MMM yyyy");
  } catch { return dateStr; }
};

export const formatDateShort = (dateStr) => {
  try { return format(parseISO(dateStr), "dd MMM"); } catch { return dateStr; }
};

export const groupExpensesByDate = (expenses) => {
  const groups = {};
  [...expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach((exp) => {
      const key = formatDate(exp.date);
      if (!groups[key]) groups[key] = [];
      groups[key].push(exp);
    });
  return groups;
};

export const getTotalByCategory = (expenses) => {
  const totals = {};
  expenses.forEach(({ category, amount }) => {
    totals[category] = (totals[category] || 0) + Number(amount);
  });
  return totals;
};

export const filterExpenses = (expenses, filters) => {
  let result = [...expenses];
  if (filters.category && filters.category !== "all") result = result.filter((e) => e.category === filters.category);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter((e) => e.note?.toLowerCase().includes(q) || e.category?.toLowerCase().includes(q));
  }
  if (filters.dateFrom) result = result.filter((e) => new Date(e.date) >= new Date(filters.dateFrom));
  if (filters.dateTo) result = result.filter((e) => new Date(e.date) <= new Date(filters.dateTo));
  if (filters.minAmount) result = result.filter((e) => Number(e.amount) >= Number(filters.minAmount));
  if (filters.maxAmount) result = result.filter((e) => Number(e.amount) <= Number(filters.maxAmount));
  if (filters.sort === "highest") result.sort((a, b) => Number(b.amount) - Number(a.amount));
  else result.sort((a, b) => new Date(b.date) - new Date(a.date));
  return result;
};

export const getMonthlyTrend = (expenses, months = 6) => {
  const result = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = subMonths(new Date(), i);
    const key = format(d, "MMM yy");
    const monthStart = startOfMonth(d);
    const monthEnd = endOfMonth(d);
    const total = expenses
      .filter((e) => { try { return isWithinInterval(parseISO(e.date), { start: monthStart, end: monthEnd }); } catch { return false; } })
      .reduce((s, e) => s + Number(e.amount), 0);
    result.push({ month: key, total });
  }
  return result;
};

export const getDailyTrend = (expenses, limit = 7) => {
  const days = {};
  expenses.forEach(({ date, amount }) => {
    try {
      const iso = format(parseISO(date), "yyyy-MM-dd");
      days[iso] = (days[iso] || 0) + Number(amount);
    } catch {}
  });
  const sorted = Object.keys(days).sort((a, b) => new Date(a) - new Date(b));
  const picked = sorted.slice(-limit);
  return picked.map((iso) => ({ iso, date: format(parseISO(iso), "dd MMM"), total: days[iso] }));
};

export const getThisMonthExpenses = (expenses) => {
  const now = new Date();
  return expenses.filter((e) => {
    try { return isWithinInterval(parseISO(e.date), { start: startOfMonth(now), end: endOfMonth(now) }); }
    catch { return false; }
  });
};

export const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const exportToCSV = (expenses) => {
  const headers = ["Date", "Category", "Amount", "Note"];
  const rows = expenses.map((e) => [e.date, e.category, e.amount, e.note || ""]);
  const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `finflow-expenses-${format(new Date(), "yyyy-MM-dd")}.csv`;
  a.click(); URL.revokeObjectURL(url);
};
