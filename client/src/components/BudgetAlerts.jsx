import { useState, useMemo } from "react";
import * as Icons from "lucide-react";
import { AlertTriangle, Bell, X, CheckCircle } from "lucide-react";
import { getThisMonthExpenses, getTotalByCategory, formatCurrency } from "../utils/helpers";
import { getCategoryById } from "../utils/categories";

export default function BudgetAlerts({ budgets = [], expenses = [], onViewBudget = () => { }, onClose = () => { } }) {
    const [dismissed, setDismissed] = useState([]);

    const alerts = useMemo(() => {
        if (!budgets || budgets.length === 0) return [];
        const thisMonth = getThisMonthExpenses(expenses || []);
        const spentByCategory = getTotalByCategory(thisMonth);

        return budgets.map((b) => {
            const spent = spentByCategory[b.category] || 0;
            // normalize budget limit to monthly equivalent based on period
            let monthlyLimit = Number(b.limit) || 0;
            if (b.period === "weekly") monthlyLimit = monthlyLimit * 4;
            if (b.period === "yearly") monthlyLimit = monthlyLimit / 12;

            const pct = monthlyLimit > 0 ? (spent / monthlyLimit) * 100 : 0;
            const isOver = spent > monthlyLimit;
            const isNear = !isOver && pct >= 80;
            return { budget: b, spent, monthlyLimit, pct, isOver, isNear };
        }).filter((a) => a.isOver || a.isNear).sort((x, y) => (Number(y.isOver) - Number(x.isOver)) || (y.pct - x.pct));
    }, [budgets, expenses]);

    if (!alerts || alerts.length === 0) return null;

    return (
        <div className="glass-card p-4 space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="text-rose" />
                    <h3 className="font-display font-bold text-white">Budget Alerts</h3>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 flex items-center justify-center">
                    <X size={12} />
                </button>
            </div>

            <div className="space-y-2">
                {alerts.map((a) => {
                    if (dismissed.includes(a.budget.id)) return null;
                    const cat = getCategoryById(a.budget.category);
                    return (
                        <div key={a.budget.id} className={`flex items-start gap-3 p-3 rounded-xl border ${a.isOver ? "border-rose/20 bg-rose/6" : "border-yellow-500/20 bg-yellow-500/6"}`}>

                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-md flex items-center justify-center ${cat.bg} border ${cat.border}`}>
                                        {(() => {
                                            const Icon = Icons[cat.icon] || Icons.Package;
                                            return <Icon size={16} style={{ color: cat.color }} />;
                                        })()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-display font-bold text-white">{cat.label}</p>
                                        <p className="text-xs text-white/60 mt-0.5">
                                            {a.isOver
                                                ? `Over by ${formatCurrency(a.spent - a.monthlyLimit)} — limit ${formatCurrency(a.monthlyLimit)}`
                                                : `${Math.round(a.pct)}% of limit used — ${formatCurrency(Math.max(0, a.monthlyLimit - a.spent))} remaining`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <button onClick={() => { onViewBudget(a.budget.id); }} className="btn-ghost text-xs">View</button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

