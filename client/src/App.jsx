import { useState } from "react";
import { LayoutDashboard, List, BarChart2, Target, Wallet, TrendingUp, User, Plus, Zap, LogOut, UserCircle } from "lucide-react";
import { Palmtree, Car, Home, Heart, Smartphone, Plane, GraduationCap, Dumbbell, Gift, ShoppingBag, PiggyBank } from "lucide-react";
import { useExpenses } from "./hooks/useExpenses";
import { filterExpenses, formatCurrency, getThisMonthExpenses } from "./utils/helpers";
import StatsCards from "./components/StatsCards";
import FilterBar from "./components/FilterBar";
import ExpenseList from "./components/ExpenseList";
import Charts from "./components/Charts";
import CategoryBreakdown from "./components/CategoryBreakdown";
import AddExpenseModal from "./components/AddExpenseModal";
import BudgetAlerts from "./components/BudgetAlerts";
import BudgetPage from "./pages/BudgetPage";
import GoalsPage from "./pages/GoalsPage";
import IncomePage from "./pages/IncomePage";
import ReportsPage from "./pages/ReportsPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import { AuthProvider, useAuth } from "./context/AuthContext";

const defaultFilters = { search: "", category: "all", dateFrom: "", dateTo: "", minAmount: "", maxAmount: "", sort: "recent" };

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "expenses", label: "Expenses", icon: List },
  { id: "income", label: "Income", icon: TrendingUp },
  { id: "budget", label: "Budget", icon: Wallet },
  { id: "goals", label: "Goals", icon: Target },
  { id: "reports", label: "Reports", icon: BarChart2 },
  { id: "profile", label: "Profile", icon: User },
];

const MOBILE_NAV = [
  { id: "dashboard", label: "Home", icon: LayoutDashboard },
  { id: "expenses", label: "Expenses", icon: List },
  { id: "budget", label: "Budget", icon: Wallet },
  { id: "goals", label: "Goals", icon: Target },
  { id: "profile", label: "Profile", icon: User },
];

function AuthGate() {
  const [authPage, setAuthPage] = useState("login");
  const [prefill, setPrefill] = useState(null);

  const navigate = (page, data = null) => {
    setPrefill(data);
    setAuthPage(page);
  };

  if (authPage === "signup") return <SignupPage onNavigate={navigate} />;
  if (authPage === "forgot") return <ForgotPasswordPage onNavigate={navigate} />;
  return <LoginPage onNavigate={navigate} prefill={prefill} />;
}

function MainApp() {
  const { currentUser, logout } = useAuth();
  const { expenses, addExpense, deleteExpense, updateExpense, clearAll, clearAllData, budgets, addBudget, deleteBudget, updateBudget, goals, addGoal, updateGoalProgress, deleteGoal, updateGoal, incomes, addIncome, deleteIncome, updateIncome, profile, updateProfile } = useExpenses();
  const [filters, setFilters] = useState(defaultFilters);
  const [showModal, setShowModal] = useState(false);
  const [showBudgetAlerts, setShowBudgetAlerts] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const filtered = filterExpenses(expenses, filters);

  const displayName = currentUser?.name || profile?.name || "there";

  const GOAL_ICONS = [
    { id: "goal", Icon: Target, label: "Goal", color: "text-electric-400", bg: "bg-electric-500/15", border: "border-electric-500/25" },
    { id: "vacation", Icon: Palmtree, label: "Vacation", color: "text-amber-400", bg: "bg-amber-500/15", border: "border-amber-500/25" },
    { id: "vehicle", Icon: Car, label: "Vehicle", color: "text-sky-400", bg: "bg-sky-500/15", border: "border-sky-500/25" },
    { id: "home", Icon: Home, label: "Home", color: "text-violet-400", bg: "bg-violet-500/15", border: "border-violet-500/25" },
    { id: "health", Icon: Heart, label: "Health", color: "text-rose-400", bg: "bg-rose-500/15", border: "border-rose-500/25" },
    { id: "gadget", Icon: Smartphone, label: "Gadget", color: "text-cyan-400", bg: "bg-cyan-500/15", border: "border-cyan-500/25" },
    { id: "travel", Icon: Plane, label: "Travel", color: "text-indigo-400", bg: "bg-indigo-500/15", border: "border-indigo-500/25" },
    { id: "education", Icon: GraduationCap, label: "Education", color: "text-teal-400", bg: "bg-teal-500/15", border: "border-teal-500/25" },
    { id: "fitness", Icon: Dumbbell, label: "Fitness", color: "text-orange-400", bg: "bg-orange-500/15", border: "border-orange-500/25" },
    { id: "gift", Icon: Gift, label: "Gift", color: "text-pink-400", bg: "bg-pink-500/15", border: "border-pink-500/25" },
    { id: "shopping", Icon: ShoppingBag, label: "Shopping", color: "text-purple-400", bg: "bg-purple-500/15", border: "border-purple-500/25" },
    { id: "savings", Icon: PiggyBank, label: "Savings", color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/25" },
  ];

  return (
    <div className="min-h-screen app-bg text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-navy-border/70 bg-navy/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-electric-500 to-neon flex items-center justify-center shadow-electric">
              <Zap size={17} className="text-navy font-black" />
            </div>
            <div>
              <h1 className="font-display font-black text-base text-white leading-none tracking-tight">FinFlow</h1>
              <p className="text-[10px] text-white/30 font-body leading-none mt-0.5">Personal Finance Manager</p>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 bg-navy-card/60 border border-navy-border p-1 rounded-2xl backdrop-blur-sm">
            {NAV.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`nav-item ${activeTab === id ? "nav-item-active" : "nav-item-inactive"}`}>
                <Icon size={14} />{label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-1.5">
              <Plus size={15} /><span className="hidden sm:inline">Add Expense</span><span className="sm:hidden">Add</span>
            </button>
            {/* User avatar + logout */}
            <div className="relative">
              <button
                onClick={() => setShowLogoutConfirm((v) => !v)}
                className="w-9 h-9 rounded-xl bg-electric-500/15 border border-electric-500/25 flex items-center justify-center text-electric-400 hover:bg-electric-500/25 transition-all"
              >
                <UserCircle size={20} />
              </button>
              {showLogoutConfirm && (
                <div className="absolute right-0 top-12 w-44 glass-card p-3 animate-pop z-50 space-y-1">
                  <p className="text-xs font-display font-semibold text-white/50 px-2 pb-1 border-b border-navy-border truncate">{currentUser?.email}</p>
                  <button
                    onClick={() => { setShowLogoutConfirm(false); logout(); }}
                    className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-rose/10 text-rose text-sm font-display font-semibold transition-all"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Backdrop for logout dropdown */}
      {showLogoutConfirm && <div className="fixed inset-0 z-30" onClick={() => setShowLogoutConfirm(false)} />}

      {/* Main */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 pb-24 md:pb-6">
        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h2 className="section-title">Hi, have a good day {displayName}! 👋</h2>
              <p className="section-sub">Here's your financial overview</p>
            </div>
            <StatsCards expenses={expenses} incomes={incomes} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 space-y-5">
                <Charts expenses={expenses} />
                <div className="glass-card overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-navy-border">
                    <h3 className="font-display font-bold text-white">Recent Expenses</h3>
                    <button onClick={() => setActiveTab("expenses")} className="text-xs text-electric-400 hover:text-electric-300 font-display font-semibold transition-colors">View all →</button>
                  </div>
                  <ExpenseList expenses={filtered.slice(0, 5)} onDelete={deleteExpense} />
                </div>
              </div>
              <div className="space-y-4">
                {showBudgetAlerts && <BudgetAlerts budgets={budgets} expenses={expenses} onViewBudget={(id) => setActiveTab("budget")} onClose={() => setShowBudgetAlerts(false)} />}
                <CategoryBreakdown expenses={expenses} />
                {goals.length > 0 && (
                  <div className="glass-card p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-display font-bold text-white">Goals</p>
                        <p className="text-xs text-white/40">Track your savings targets</p>
                      </div>
                      <button onClick={() => setActiveTab("goals")} className="text-xs text-electric-400 hover:text-electric-300 font-display font-semibold transition-colors">View all →</button>
                    </div>
                    <div className="space-y-3">
                      {goals.slice(0, 2).map((g) => {
                        const pct = Math.min((g.saved / g.target) * 100, 100);
                        const meta = GOAL_ICONS.find((gi) => gi.id === g.iconId) ?? GOAL_ICONS[0];
                        const { Icon, color, bg, border } = meta;
                        return (
                          <div key={g.id} className="flex items-center justify-between p-3 rounded-lg bg-navy-soft">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg} border ${border}`}>
                                <Icon size={18} className={color} />
                              </div>
                              <div>
                                <p className="text-sm font-display font-semibold text-white">{g.name}</p>
                                <p className="text-xs text-white/40">{formatCurrency(g.saved)} / {formatCurrency(g.target)}</p>
                              </div>
                            </div>
                            <div style={{ width: 140 }}>
                              <div className="progress-bar h-2"><div className="progress-fill" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#0d87f0,#00e5a0)" }} /></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Expenses */}
        {activeTab === "expenses" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="section-title">All Expenses</h2>
                <p className="section-sub">{filtered.length} of {expenses.length} entries</p>
              </div>
            </div>
            <FilterBar filters={filters} onChange={setFilters} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 space-y-4">
                <Charts expenses={filtered} />
                <ExpenseList expenses={filtered} onDelete={deleteExpense} />
              </div>
              <div className="space-y-4">
                <CategoryBreakdown expenses={filtered} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "income" && <IncomePage incomes={incomes} addIncome={addIncome} deleteIncome={deleteIncome} updateIncome={updateIncome} expenses={expenses} />}
        {activeTab === "budget" && <BudgetPage budgets={budgets} addBudget={addBudget} deleteBudget={deleteBudget} expenses={expenses} />}
        {activeTab === "goals" && <GoalsPage goals={goals} addGoal={addGoal} updateGoalProgress={updateGoalProgress} deleteGoal={deleteGoal} updateGoal={updateGoal} />}
        {activeTab === "reports" && <ReportsPage expenses={expenses} incomes={incomes} budgets={budgets} />}
        {activeTab === "profile" && <ProfilePage profile={profile} updateProfile={updateProfile} expenses={expenses} incomes={incomes} clearAll={clearAllData} />}
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-navy-border/70 bg-navy/90 backdrop-blur-xl">
        <div className="flex items-center justify-around px-2 py-2">
          {MOBILE_NAV.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all ${activeTab === id ? "text-electric-400" : "text-white/30"}`}>
              <Icon size={20} />
              <span className="text-[10px] font-display font-semibold">{label}</span>
            </button>
          ))}
          <button onClick={() => setShowModal(true)} className="flex flex-col items-center gap-1 py-1.5 px-3">
            <div className="w-10 h-10 bg-gradient-to-br from-electric-500 to-neon rounded-xl flex items-center justify-center -mt-6 shadow-electric">
              <Plus size={20} className="text-navy" />
            </div>
            <span className="text-[10px] font-display font-semibold text-white/40 mt-0.5">Add</span>
          </button>
        </div>
      </nav>

      {(activeTab === "income" || activeTab === "reports") && (
        <div className="lg:hidden fixed bottom-20 left-4 right-4 z-30">
          <div className="glass-card flex gap-2 p-2">
            {[{ id: "income", label: "Income", icon: TrendingUp }, { id: "reports", label: "Reports", icon: BarChart2 }].map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-display font-semibold transition-all ${activeTab === id ? "bg-electric-500/20 text-electric-400 border border-electric-500/30" : "text-white/40 hover:text-white/60"}`}>
                <Icon size={14} />{label}
              </button>
            ))}
          </div>
        </div>
      )}

      {showModal && <AddExpenseModal onAdd={addExpense} onClose={() => setShowModal(false)} />}
    </div>
  );
}

function AppInner() {
  const { currentUser } = useAuth();
  if (!currentUser) return <AuthGate />;
  return <MainApp />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
