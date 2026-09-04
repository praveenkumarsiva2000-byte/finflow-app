export const CATEGORIES = [
  { id: "food", label: "Food & Dining", icon: "Utensils", color: "#f97316", bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/25" },
  { id: "travel", label: "Travel", icon: "Plane", color: "#38bdf8", bg: "bg-sky-500/15", text: "text-sky-400", border: "border-sky-500/25" },
  { id: "bills", label: "Bills & Utilities", icon: "Zap", color: "#facc15", bg: "bg-yellow-500/15", text: "text-yellow-400", border: "border-yellow-500/25" },
  { id: "shopping", label: "Shopping", icon: "ShoppingBag", color: "#a78bfa", bg: "bg-violet-500/15", text: "text-violet-400", border: "border-violet-500/25" },
  { id: "health", label: "Health & Fitness", icon: "Heart", color: "#ff4f7b", bg: "bg-rose-500/15", text: "text-rose-400", border: "border-rose-500/25" },
  { id: "entertainment", label: "Entertainment", icon: "Gamepad2", color: "#22d3ee", bg: "bg-cyan-500/15", text: "text-cyan-400", border: "border-cyan-500/25" },
  { id: "education", label: "Education", icon: "BookOpen", color: "#00e5a0", bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/25" },
  { id: "groceries", label: "Groceries", icon: "ShoppingCart", color: "#84cc16", bg: "bg-lime-500/15", text: "text-lime-400", border: "border-lime-500/25" },
  { id: "rent", label: "Rent & Housing", icon: "Home", color: "#fb923c", bg: "bg-orange-600/15", text: "text-orange-300", border: "border-orange-600/25" },
  { id: "subscriptions", label: "Subscriptions", icon: "RefreshCw", color: "#818cf8", bg: "bg-indigo-500/15", text: "text-indigo-400", border: "border-indigo-500/25" },
  { id: "others", label: "Others", icon: "Package", color: "#94a3b8", bg: "bg-slate-500/15", text: "text-slate-400", border: "border-slate-500/25" },
];

export const INCOME_CATEGORIES = [
  { id: "salary", label: "Salary", icon: "Briefcase", color: "#00e5a0" },
  { id: "freelance", label: "Freelance", icon: "Laptop", color: "#38bdf8" },
  { id: "investment", label: "Investment", icon: "TrendingUp", color: "#f5c842" },
  { id: "business", label: "Business", icon: "Building2", color: "#a78bfa" },
  { id: "gift", label: "Gift / Other", icon: "Gift", color: "#fb923c" },
];

// ── Custom categories ───────────────────────────────────────────────────────
// Per-user categories added on top of the predefined lists above, persisted via
// profile.preferences.customCategories and mirrored here (same pattern as
// setCurrency in helpers.js) so every picker/lookup in the app can see them
// without prop-drilling the profile through every component.
const hashStr = (s) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

// Reuse the exact Tailwind class strings already present in CATEGORIES so the
// JIT compiler has statically seen them — dynamically built class names would
// be purged from the production CSS build.
const EXPENSE_STYLE_POOL = CATEGORIES.map(({ bg, text, border, color }) => ({ bg, text, border, color }));
const INCOME_COLOR_POOL = INCOME_CATEGORIES.map((c) => c.color);

let customExpenseCategories = [];
let customIncomeCategories = [];

export const setCustomCategories = (custom) => {
  customExpenseCategories = Array.isArray(custom?.expense) ? custom.expense : [];
  customIncomeCategories = Array.isArray(custom?.income) ? custom.income : [];
};

const decorateExpense = (c) => ({ icon: "Tag", ...EXPENSE_STYLE_POOL[hashStr(c.id) % EXPENSE_STYLE_POOL.length], ...c, custom: true });
const decorateIncome = (c) => ({ icon: "Tag", color: INCOME_COLOR_POOL[hashStr(c.id) % INCOME_COLOR_POOL.length], ...c, custom: true });

export const getCategories = () => [...CATEGORIES, ...customExpenseCategories.map(decorateExpense)];
export const getIncomeCategories = () => [...INCOME_CATEGORIES, ...customIncomeCategories.map(decorateIncome)];

export const getCategoryById = (id) =>
  getCategories().find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];

export const getIncomeCategoryById = (id) =>
  getIncomeCategories().find((c) => c.id === id) || INCOME_CATEGORIES[INCOME_CATEGORIES.length - 1];

// Turns a user-typed label into a unique, storage-safe id.
export const slugifyCategory = (label, existingIds) => {
  const base = label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-+|-+$)/g, "") || "category";
  let id = base;
  let n = 2;
  while (existingIds.includes(id)) { id = `${base}-${n}`; n++; }
  return id;
};
