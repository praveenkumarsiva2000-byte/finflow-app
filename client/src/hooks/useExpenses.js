import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";

export function useExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load everything once on mount
  useEffect(() => {
    const token = localStorage.getItem("finflow_token");
    if (!token) { setLoading(false); return; }

    const loadAll = async () => {
      try {
        // ensure recurring templates generate this month's actual expenses
        try { await api.generateRecurring(); } catch (e) { /* non-fatal */ }
        const [exp, inc, bud, gls, prof] = await Promise.all([
          api.getExpenses(),
          api.getIncomes(),
          api.getBudgets(),
          api.getGoals(),
          api.getProfile(),
        ]);
        setExpenses(exp);
        setIncomes(inc);
        setBudgets(bud);
        setGoals(gls);
        setProfile(prof);
      } catch (err) {
        console.error("Failed to load data:", err.message);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  // ── Expenses ────────────────────────────────────────────────────────────
  const addExpense = useCallback(async (data) => {
    try {
      const item = await api.addExpense(data);
      setExpenses((prev) => [item, ...prev]);
      return item;
    } catch (err) { console.error(err.message); }
  }, []);

  const deleteExpense = useCallback(async (id) => {
    try {
      await api.deleteExpense(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch (err) { console.error(err.message); }
  }, []);

  const updateExpense = useCallback(async (id, data) => {
    try {
      const item = await api.updateExpense(id, data);
      setExpenses((prev) => prev.map((e) => (e.id === id ? item : e)));
      return item;
    } catch (err) { console.error(err.message); }
  }, []);

  // ── Incomes ─────────────────────────────────────────────────────────────
  const addIncome = useCallback(async (data) => {
    try {
      const item = await api.addIncome(data);
      setIncomes((prev) => [item, ...prev]);
      return item;
    } catch (err) { console.error(err.message); }
  }, []);

  const deleteIncome = useCallback(async (id) => {
    try {
      await api.deleteIncome(id);
      setIncomes((prev) => prev.filter((i) => i.id !== id));
    } catch (err) { console.error(err.message); }
  }, []);

  const updateIncome = useCallback(async (id, data) => {
    try {
      const item = await api.updateIncome(id, data);
      setIncomes((prev) => prev.map((i) => (i.id === id ? item : i)));
      return item;
    } catch (err) { console.error(err.message); }
  }, []);

  // ── Budgets ─────────────────────────────────────────────────────────────
  const addBudget = useCallback(async (data) => {
    try {
      const item = await api.addBudget(data);
      setBudgets((prev) => {
        const filtered = prev.filter((b) => b.category !== data.category);
        return [item, ...filtered];
      });
      return item;
    } catch (err) { console.error(err.message); }
  }, []);

  const deleteBudget = useCallback(async (id) => {
    try {
      await api.deleteBudget(id);
      setBudgets((prev) => prev.filter((b) => b.id !== id));
    } catch (err) { console.error(err.message); }
  }, []);

  const updateBudget = useCallback(async (id, data) => {
    try {
      const item = await api.updateBudget(id, data);
      setBudgets((prev) => prev.map((b) => (b.id === id ? item : b)));
      return item;
    } catch (err) { console.error(err.message); }
  }, []);

  // ── Goals ────────────────────────────────────────────────────────────────
  const addGoal = useCallback(async (data) => {
    try {
      const item = await api.addGoal(data);
      // Ensure iconId is preserved (server may omit it for legacy reasons)
      const ensured = { ...(item || {}), iconId: item?.iconId || data?.iconId || "goal" };
      setGoals((prev) => [ensured, ...prev]);
      return item;
    } catch (err) { console.error(err.message); }
  }, []);

  const updateGoalProgress = useCallback(async (id, saved) => {
    try {
      const item = await api.updateGoal(id, { saved });
      setGoals((prev) => prev.map((g) => (g.id === id ? item : g)));
    } catch (err) { console.error(err.message); }
  }, []);

  const deleteGoal = useCallback(async (id) => {
    try {
      await api.deleteGoal(id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
    } catch (err) { console.error(err.message); }
  }, []);

  const updateGoal = useCallback(async (id, data) => {
    try {
      const item = await api.updateGoal(id, data);
      const ensured = { ...(item || {}), iconId: item?.iconId || data?.iconId || "goal" };
      setGoals((prev) => prev.map((g) => (g.id === id ? ensured : g)));
      return item;
    } catch (err) { console.error(err.message); }
  }, []);

  // ── Profile ──────────────────────────────────────────────────────────────
  const updateProfile = useCallback(async (data) => {
    try {
      const updated = await api.updateProfile(data);
      setProfile(updated);
      return updated;
    } catch (err) { console.error(err.message); }
  }, []);

  // ── Clear all financial data (keep user/auth) ────────────────────────────
  const clearAll = useCallback(async () => {
    try {
      await Promise.all([
        api.clearExpenses(),
        api.clearIncomes(),
        api.clearBudgets(),
        api.clearGoals(),
      ]);
      setExpenses([]);
      setIncomes([]);
      setBudgets([]);
      setGoals([]);
    } catch (err) { console.error(err.message); }
  }, []);

  return {
    expenses, incomes, budgets, goals, profile, loading,
    addExpense, deleteExpense,
    updateExpense,
    addIncome, deleteIncome,
    updateIncome,
    addBudget, deleteBudget,
    updateBudget,
    addGoal, updateGoalProgress, deleteGoal,
    updateGoal,
    updateProfile,
    clearAll, clearAllData: clearAll,
  };
}
