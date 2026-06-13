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

export const getCategoryById = (id) =>
  CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];

export const INCOME_CATEGORIES = [
  { id: "salary", label: "Salary", icon: "Briefcase", color: "#00e5a0" },
  { id: "freelance", label: "Freelance", icon: "Laptop", color: "#38bdf8" },
  { id: "investment", label: "Investment", icon: "TrendingUp", color: "#f5c842" },
  { id: "business", label: "Business", icon: "Building2", color: "#a78bfa" },
  { id: "gift", label: "Gift / Other", icon: "Gift", color: "#fb923c" },
];

export const getIncomeCategoryById = (id) =>
  INCOME_CATEGORIES.find((c) => c.id === id) || INCOME_CATEGORIES[INCOME_CATEGORIES.length - 1];
