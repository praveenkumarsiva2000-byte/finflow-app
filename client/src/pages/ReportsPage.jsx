import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, PieChart, Pie, Cell } from "recharts";
import * as Icons from "lucide-react";
import { Download, FileText, TrendingUp, PieChart as PieIcon, BarChart2 } from "lucide-react";
import { CATEGORIES, getCategoryById } from "../utils/categories";
import { formatCurrency, getMonthlyTrend, getTotalByCategory, exportToCSV } from "../utils/helpers";
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO, subMonths } from "date-fns";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function ReportsPage({ expenses, incomes = [], budgets = [] }) {
  const [range, setRange] = useState("3m");
  const months = range === "1m" ? 1 : range === "3m" ? 3 : range === "6m" ? 6 : 12;

  const expenseTrend = getMonthlyTrend(expenses, months);
  const incomeTrend = Array.from({ length: months }, (_, i) => {
    const d = subMonths(new Date(), months - 1 - i);
    const key = format(d, "MMM yy");
    const s = startOfMonth(d); const e = endOfMonth(d);
    const total = incomes.filter((inc) => { try { return isWithinInterval(parseISO(inc.date), { start: s, end: e }); } catch { return false; } }).reduce((sum, i) => sum + Number(i.amount), 0);
    return { month: key, total };
  });

  const combined = expenseTrend.map((e, i) => ({ month: e.month, expenses: e.total, income: incomeTrend[i]?.total || 0, savings: (incomeTrend[i]?.total || 0) - e.total }));

  const categoryTotals = getTotalByCategory(expenses);
  const total = Object.values(categoryTotals).reduce((s, v) => s + v, 0);
  const pieData = CATEGORIES.filter((c) => categoryTotals[c.id] > 0).map((c) => ({ name: c.label, value: categoryTotals[c.id], color: c.color, pct: total > 0 ? Math.round((categoryTotals[c.id] / total) * 100) : 0 }));

  const now = new Date();
  const monthStart = startOfMonth(now); const monthEnd = endOfMonth(now);
  const inMonth = (item) => { try { return isWithinInterval(parseISO(item.date), { start: monthStart, end: monthEnd }); } catch { return false; } };
  const thisMonthExp = expenses.filter(inMonth).reduce((s, e) => s + Number(e.amount), 0);
  const thisMonthInc = incomes.filter(inMonth).reduce((s, i) => s + Number(i.amount), 0);
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const totalIncome = incomes.reduce((s, i) => s + Number(i.amount), 0);
  const savingsRate = thisMonthInc > 0 ? ((thisMonthInc - thisMonthExp) / thisMonthInc * 100) : 0;

  // ── Financial Forecasting ────────────────────────────────────────────────
  // Average monthly spending over available months
  const avgMonthlyExp = expenseTrend.length > 0
    ? expenseTrend.reduce((s, m) => s + m.total, 0) / expenseTrend.length : 0;
  const avgMonthlyInc = incomeTrend.length > 0
    ? incomeTrend.reduce((s, m) => s + m.total, 0) / incomeTrend.length : 0;
  // Month-over-month growth rate (last 2 months)
  const expGrowth = expenseTrend.length >= 2
    ? ((expenseTrend[expenseTrend.length - 1].total - expenseTrend[expenseTrend.length - 2].total) /
      Math.max(expenseTrend[expenseTrend.length - 2].total, 1)) : 0;
  // Project next 3 months
  const forecastData = Array.from({ length: 3 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
    const label = format(d, "MMM yy");
    const projected = avgMonthlyExp * (1 + expGrowth * 0.5); // dampen growth
    const incProjected = avgMonthlyInc;
    return { month: label, projectedExpense: Math.round(projected), projectedIncome: Math.round(incProjected), projectedSavings: Math.round(incProjected - projected) };
  });
  const annualProjectedExp = avgMonthlyExp * 12;
  const annualProjectedInc = avgMonthlyInc * 12;
  // Suggestions
  const suggestions = [];
  if (savingsRate < 20 && thisMonthInc > 0) suggestions.push({ icon: "TrendingDown", color: "text-rose", text: `Your savings rate is ${savingsRate.toFixed(0)}%. Aim for at least 20% — try reducing discretionary spend by ₹${Math.round((thisMonthExp * 0.1)).toLocaleString("en-IN")}/month.` });
  if (savingsRate >= 20) suggestions.push({ icon: "CheckCircle2", color: "text-neon", text: `Great savings rate of ${savingsRate.toFixed(0)}%! Keep it up and consider investing the surplus.` });
  const topCat = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  if (topCat) { const c = getCategoryById(topCat[0]); suggestions.push({ icon: "AlertTriangle", color: "text-amber", text: `Your highest spend is ${c.label} at ${formatCurrency(topCat[1])}. Setting a budget here could save you significantly.` }); }
  if (expGrowth > 0.1) suggestions.push({ icon: "TrendingUp", color: "text-rose", text: `Expenses grew ${(expGrowth * 100).toFixed(0)}% last month. Review recent transactions to identify and cut unnecessary costs.` });
  if (annualProjectedExp > annualProjectedInc && annualProjectedInc > 0) suggestions.push({ icon: "AlertTriangle", color: "text-rose", text: `At current rates, annual expenses (${formatCurrency(annualProjectedExp)}) may exceed income (${formatCurrency(annualProjectedInc)}). Adjust your budget now.` });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) return (
      <div className="glass-card px-3 py-2 text-xs space-y-1">
        <p className="font-display font-bold text-white/70">{label}</p>
        {payload.map((p) => <p key={p.name} style={{ color: p.color }} className="font-semibold">{p.name}: {formatCurrency(p.value)}</p>)}
      </div>
    );
    return null;
  };

  // ── Real PDF export using jsPDF + autoTable ──────────────────────────────
  const exportPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const generated = format(new Date(), "dd MMM yyyy, hh:mm a");

    // Header bar
    doc.setFillColor(13, 135, 240);
    doc.rect(0, 0, pageW, 22, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("FinFlow — Financial Report", 14, 14);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${generated}`, pageW - 14, 14, { align: "right" });

    let y = 32;

    // ── Section helper ──
    const sectionTitle = (title) => {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(13, 135, 240);
      doc.text(title, 14, y);
      doc.setDrawColor(13, 135, 240);
      doc.setLineWidth(0.3);
      doc.line(14, y + 1.5, pageW - 14, y + 1.5);
      y += 8;
    };

    // ── Summary ──
    sectionTitle("Summary");
    const summaryData = [
      ["Total Expenses", formatCurrency(totalExpenses)],
      ["Total Income", formatCurrency(totalIncome)],
      ["Net Savings", formatCurrency(totalIncome - totalExpenses)],
      ["This Month Expenses", formatCurrency(thisMonthExp)],
      ["This Month Income", formatCurrency(thisMonthInc)],
      ["Savings Rate", `${Math.max(0, savingsRate).toFixed(1)}%`],
    ];
    autoTable(doc, {
      startY: y,
      head: [["Metric", "Value"]],
      body: summaryData,
      theme: "grid",
      headStyles: { fillColor: [15, 26, 46], textColor: [255, 255, 255], fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: [30, 30, 30] },
      alternateRowStyles: { fillColor: [245, 248, 255] },
      margin: { left: 14, right: 14 },
      tableWidth: "auto",
      columnStyles: { 1: { halign: "right", fontStyle: "bold" } },
    });
    y = doc.lastAutoTable.finalY + 10;

    // ── Category Breakdown ──
    if (pieData.length > 0) {
      sectionTitle("Expense by Category");
      autoTable(doc, {
        startY: y,
        head: [["Category", "Amount", "% of Total"]],
        body: pieData.map((p) => [p.name, formatCurrency(p.value), `${p.pct}%`]),
        theme: "striped",
        headStyles: { fillColor: [15, 26, 46], textColor: [255, 255, 255], fontSize: 9 },
        bodyStyles: { fontSize: 9 },
        margin: { left: 14, right: 14 },
        columnStyles: { 1: { halign: "right" }, 2: { halign: "center" } },
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    // ── Budget Report ──
    if (budgets.length > 0) {
      // New page if not enough space
      if (y > 220) { doc.addPage(); y = 20; }
      sectionTitle("Budget Report");
      const budgetRows = budgets.map((b) => {
        const cat = getCategoryById(b.category);
        const spent = expenses.filter((e) => e.category === b.category && inMonth(e)).reduce((s, e) => s + Number(e.amount), 0);
        const remaining = b.limit - spent;
        const status = spent > b.limit ? "Over Budget" : spent / b.limit >= 0.8 ? "Near Limit" : "On Track";
        return [cat.label, b.period, formatCurrency(b.limit), formatCurrency(spent), formatCurrency(Math.abs(remaining)), status];
      });
      autoTable(doc, {
        startY: y,
        head: [["Category", "Period", "Budget", "Spent", "Remaining", "Status"]],
        body: budgetRows,
        theme: "grid",
        headStyles: { fillColor: [15, 26, 46], textColor: [255, 255, 255], fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        margin: { left: 14, right: 14 },
        columnStyles: {
          2: { halign: "right" }, 3: { halign: "right" }, 4: { halign: "right" }, 5: { halign: "center" },
        },
        didParseCell: (data) => {
          if (data.column.index === 5 && data.section === "body") {
            const v = data.cell.raw;
            if (v === "Over Budget") data.cell.styles.textColor = [255, 79, 123];
            else if (v === "Near Limit") data.cell.styles.textColor = [245, 200, 66];
            else data.cell.styles.textColor = [0, 180, 120];
          }
        },
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    // ── Recent Expenses ──
    if (expenses.length > 0) {
      if (y > 200) { doc.addPage(); y = 20; }
      sectionTitle("Recent Expenses (Last 20)");
      const recent = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20);
      autoTable(doc, {
        startY: y,
        head: [["Date", "Category", "Amount", "Note"]],
        body: recent.map((e) => [e.date, e.category, formatCurrency(e.amount), e.note || "—"]),
        theme: "striped",
        headStyles: { fillColor: [15, 26, 46], textColor: [255, 255, 255], fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        margin: { left: 14, right: 14 },
        columnStyles: { 2: { halign: "right" } },
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    // ── Income Summary ──
    if (incomes.length > 0) {
      if (y > 200) { doc.addPage(); y = 20; }
      sectionTitle("Income Sources");
      const incomeByCategory = {};
      incomes.forEach((i) => { incomeByCategory[i.category] = (incomeByCategory[i.category] || 0) + Number(i.amount); });
      autoTable(doc, {
        startY: y,
        head: [["Source", "Total Amount", "Entries"]],
        body: Object.entries(incomeByCategory).map(([cat, amt]) => [cat, formatCurrency(amt), incomes.filter((i) => i.category === cat).length]),
        theme: "striped",
        headStyles: { fillColor: [15, 26, 46], textColor: [255, 255, 255], fontSize: 9 },
        bodyStyles: { fontSize: 9 },
        margin: { left: 14, right: 14 },
        columnStyles: { 1: { halign: "right" }, 2: { halign: "center" } },
      });
    }

    // Footer on every page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(160, 160, 160);
      doc.text(`FinFlow v1.0 · Personal Finance Manager · Page ${i} of ${pageCount}`, pageW / 2, doc.internal.pageSize.getHeight() - 8, { align: "center" });
    }

    doc.save(`finflow-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title">Reports</h2>
          <p className="section-sub">Financial insights & analysis</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportToCSV(expenses)} className="btn-ghost flex items-center gap-1.5 text-xs"><Download size={13} />CSV</button>
          <button onClick={exportPDF} className="btn-ghost flex items-center gap-1.5 text-xs"><FileText size={13} />PDF Report</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Expenses", value: formatCurrency(totalExpenses), color: "text-rose", bg: "bg-rose/10" },
          { label: "Total Income", value: formatCurrency(totalIncome), color: "text-neon", bg: "bg-neon/10" },
          { label: "Net Savings", value: formatCurrency(totalIncome - totalExpenses), color: "text-electric-400", bg: "bg-electric-500/10" },
          { label: "Savings Rate", value: `${Math.max(0, savingsRate).toFixed(1)}%`, color: "text-gold", bg: "bg-yellow-500/10" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`glass-card p-4 border-l-2 ${bg}`}>
            <p className="text-xs font-display font-semibold text-white/40 uppercase tracking-wider">{label}</p>
            <p className={`text-xl font-display font-black mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Range selector + trend */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-white flex items-center gap-2"><TrendingUp size={17} className="text-electric-400" />Income vs Expenses</h3>
          <div className="flex gap-1 bg-navy-soft p-1 rounded-xl">
            {["1m","3m","6m","1y"].map((r) => (
              <button key={r} onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition-all ${range === r ? "bg-electric-500 text-white" : "text-white/30 hover:text-white/60"}`}>{r}</button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={combined} margin={{ top: 5, right: 0, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00e5a0" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#00e5a0" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff4f7b" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#ff4f7b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.35)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.35)" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="income" name="Income" stroke="#00e5a0" strokeWidth={2} fill="url(#incGrad)" />
            <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ff4f7b" strokeWidth={2} fill="url(#expGrad)" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex gap-4 justify-center">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-neon" /><span className="text-xs text-white/50">Income</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose" /><span className="text-xs text-white/50">Expenses</span></div>
        </div>
      </div>

      {/* ── Financial Forecasting ── */}
      <div className="glass-card p-5 space-y-5">
        <div className="flex items-center gap-2">
          <Icons.TrendingUp size={17} className="text-electric-400" />
          <h3 className="font-display font-bold text-white">Financial Forecast</h3>
          <span className="badge bg-electric-500/15 text-electric-400 border border-electric-500/25 ml-1">Next 3 months</span>
        </div>

        {avgMonthlyExp === 0 ? (
          <p className="text-sm text-white/30 text-center py-6">Add expenses to see projections</p>
        ) : (
          <>
            {/* Projected months */}
            <div className="grid grid-cols-3 gap-3">
              {forecastData.map((m) => (
                <div key={m.month} className="bg-navy-soft rounded-2xl p-4 border border-navy-border">
                  <p className="text-xs font-display font-bold text-white/40 uppercase tracking-wider mb-3">{m.month}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-white/40 font-body">Income</span>
                      <span className="text-xs font-display font-bold text-neon">{formatCurrency(m.projectedIncome)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-white/40 font-body">Expenses</span>
                      <span className="text-xs font-display font-bold text-rose">{formatCurrency(m.projectedExpense)}</span>
                    </div>
                    <div className="h-px bg-navy-border" />
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-white/40 font-body">Savings</span>
                      <span className={`text-xs font-display font-bold ${m.projectedSavings >= 0 ? "text-electric-400" : "text-rose"}`}>{formatCurrency(Math.abs(m.projectedSavings))}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Annual projection */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-neon/8 border border-neon/15">
                <Icons.TrendingUp size={16} className="text-neon shrink-0" />
                <div>
                  <p className="text-[11px] text-white/40 font-body">Projected Annual Income</p>
                  <p className="text-base font-display font-black text-neon">{formatCurrency(annualProjectedInc)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-rose/8 border border-rose/15">
                <Icons.TrendingDown size={16} className="text-rose shrink-0" />
                <div>
                  <p className="text-[11px] text-white/40 font-body">Projected Annual Expenses</p>
                  <p className="text-base font-display font-black text-rose">{formatCurrency(annualProjectedExp)}</p>
                </div>
              </div>
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-display font-bold text-white/40 uppercase tracking-wider">💡 Recommendations</p>
                {suggestions.map((s, i) => {
                  const Icon = Icons[s.icon] || Icons.Info;
                  return (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-navy-soft border border-navy-border">
                      <Icon size={15} className={`${s.color} shrink-0 mt-0.5`} />
                      <p className="text-xs text-white/60 font-body leading-relaxed">{s.text}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Category pie + Budget vs Actual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass-card p-5 space-y-4">
          <h3 className="font-display font-bold text-white flex items-center gap-2"><PieIcon size={17} className="text-violet" />Expense Distribution</h3>
          {pieData.length === 0
            ? <p className="text-sm text-white/30 text-center py-8">No data</p>
            : <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value">
                    {pieData.map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [formatCurrency(v), n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1.5">
                {pieData.slice(0, 8).map((e) => (
                  <div key={e.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: e.color }} />
                    <span className="text-xs text-white/55 truncate">{e.name}</span>
                    <span className="text-xs font-display font-bold text-white/70 ml-auto">{e.pct}%</span>
                  </div>
                ))}
              </div>
            </>}
        </div>

        <div className="glass-card p-5 space-y-4">
          <h3 className="font-display font-bold text-white flex items-center gap-2"><BarChart2 size={17} className="text-gold" />Budget vs Actual</h3>
          {budgets.length === 0
            ? <p className="text-sm text-white/30 text-center py-8">No budgets set</p>
            : <div className="space-y-3">
              {budgets.map((b) => {
                const cat = getCategoryById(b.category);
                const Icon = Icons[cat.icon] || Icons.Package;
                const spent = expenses.filter((e) => e.category === b.category && inMonth(e)).reduce((s, e) => s + Number(e.amount), 0);
                const pct = Math.min((spent / b.limit) * 100, 100);
                const over = spent > b.limit;
                return (
                  <div key={b.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5"><Icon size={13} style={{ color: cat.color }} /><span className="text-white/70">{cat.label}</span></div>
                      <span className={`font-display font-bold ${over ? "text-rose" : "text-white"}`}>{formatCurrency(spent)} / {formatCurrency(b.limit)}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%`, background: over ? "#ff4f7b" : cat.color }} />
                    </div>
                  </div>
                );
              })}
            </div>}
        </div>
      </div>
    </div>
  );
}
