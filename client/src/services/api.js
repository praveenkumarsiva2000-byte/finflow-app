const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const getToken = () => localStorage.getItem("finflow_token");

const headers = () => ({
  "Content-Type": "application/json",
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

const req = async (method, path, body) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: headers(),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
};

export const api = {
  // ── Auth ────────────────────────────────────────────────────────────────
  signup: (data) => req("POST", "/auth/signup", data),
  login: (data) => req("POST", "/auth/login", data),
  resetPassword: (data) => req("POST", "/auth/reset-password", data),
  getProfile: () => req("GET", "/auth/profile"),
  updateProfile: (data) => req("PUT", "/auth/profile", data),

  // ── Expenses ────────────────────────────────────────────────────────────
  getExpenses: () => req("GET", "/expenses"),
  addExpense: (data) => req("POST", "/expenses", data),
  generateRecurring: () => req("POST", "/expenses/generate-recurring"),
  updateExpense: (id, data) => req("PUT", `/expenses/${id}`, data),
  deleteExpense: (id) => req("DELETE", `/expenses/${id}`),
  clearExpenses: () => req("DELETE", "/expenses/all"),

  // ── Incomes ─────────────────────────────────────────────────────────────
  getIncomes: () => req("GET", "/incomes"),
  addIncome: (data) => req("POST", "/incomes", data),
  updateIncome: (id, data) => req("PUT", `/incomes/${id}`, data),
  deleteIncome: (id) => req("DELETE", `/incomes/${id}`),
  clearIncomes: () => req("DELETE", "/incomes/all"),

  // ── Budgets ─────────────────────────────────────────────────────────────
  getBudgets: () => req("GET", "/budgets"),
  addBudget: (data) => req("POST", "/budgets", data),
  deleteBudget: (id) => req("DELETE", `/budgets/${id}`),
  updateBudget: (id, data) => req("PUT", `/budgets/${id}`, data),
  clearBudgets: () => req("DELETE", "/budgets/all"),

  // ── Goals ───────────────────────────────────────────────────────────────
  getGoals: () => req("GET", "/goals"),
  addGoal: (data) => req("POST", "/goals", data),
  updateGoal: (id, data) => req("PUT", `/goals/${id}`, data),
  deleteGoal: (id) => req("DELETE", `/goals/${id}`),
  clearGoals: () => req("DELETE", "/goals/all"),
};
