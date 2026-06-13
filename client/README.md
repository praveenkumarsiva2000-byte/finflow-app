# 💸 SpendSmart — Smart Expense Tracker

A production-grade expense tracking app built with React JS + TailwindCSS + Recharts.
All data persists automatically using **localStorage** — no backend needed.

---

## ✅ Features

- **Add Expenses** — Amount, Category (8 types), Date, Note
- **Delete Expenses** — With double-tap confirmation
- **Filter & Search** — By category, date range, amount range, or keyword
- **Sort** — By most recent or highest amount
- **Charts** — Pie chart (category distribution) + Bar chart (monthly trend)
- **Category Breakdown** — Progress bars per category with totals
- **Stats Cards** — Total spent, this month, average, largest expense
- **localStorage persistence** — Survives page refresh / browser close
- **Mobile responsive** — Bottom nav on mobile, top nav on desktop
- **Dark themed UI** — Glassmorphism design with Syne + DM Sans fonts

---

## 🗂 Project Structure

```
expense-tracker/
├── public/
│   └── index.html              # HTML shell + Google Fonts
├── src/
│   ├── components/
│   │   ├── AddExpenseModal.jsx  # Modal form to add a new expense
│   │   ├── CategoryBreakdown.jsx # Category totals with progress bars
│   │   ├── Charts.jsx           # Pie + Bar charts (Recharts)
│   │   ├── ExpenseItem.jsx      # Single expense row with delete
│   │   ├── ExpenseList.jsx      # Grouped list by date
│   │   ├── FilterBar.jsx        # Search, category pills, advanced filters
│   │   └── StatsCards.jsx       # 4 summary stat cards
│   ├── hooks/
│   │   └── useExpenses.js       # All expense CRUD + localStorage sync
│   ├── utils/
│   │   ├── categories.js        # Category definitions (id, emoji, color, etc.)
│   │   └── helpers.js           # Currency format, date, filter, group logic
│   ├── App.jsx                  # Root: tabs (Dashboard / Expenses / Analytics)
│   ├── index.js                 # React DOM entry
│   └── index.css                # Tailwind + global styles + animations
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## 🚀 Step-by-Step Setup Instructions

### Prerequisites
- Node.js v16 or higher → https://nodejs.org
- npm (comes with Node)

### Step 1 — Copy all project files
Place all the files in a folder called `expense-tracker` exactly as shown in the structure above.

### Step 2 — Open a terminal in the project folder
```bash
cd expense-tracker
```

### Step 3 — Install dependencies
```bash
npm install
```
This installs React, TailwindCSS, Recharts, Lucide Icons, and date-fns.

### Step 4 — Start the development server
```bash
npm start
```
The app opens at **http://localhost:3000**

### Step 5 — Build for production (optional)
```bash
npm run build
```
Creates an optimized `build/` folder you can deploy anywhere.

---

## 📦 Dependencies Used

| Package | Purpose |
|---------|---------|
| `react` / `react-dom` | UI framework |
| `react-scripts` | CRA build tooling |
| `tailwindcss` | Utility-first CSS |
| `recharts` | Pie + Bar charts |
| `lucide-react` | Icon library |
| `date-fns` | Date formatting & manipulation |

---

## 🧠 How localStorage Works in This App

- All expenses are stored under the key `spendsmart_expenses` in localStorage
- Every time an expense is added or deleted, `localStorage.setItem()` is called automatically
- On app load, `localStorage.getItem()` restores all previous data
- You can inspect it in DevTools → Application → Local Storage → localhost

---

## 🎨 Tech Choices

- **Syne** (display font) + **DM Sans** (body font) loaded from Google Fonts
- Dark glassmorphism theme using Tailwind's `backdrop-blur`, `bg-white/5`, `border-white/10`
- CSS keyframe animations (`slideUp`, `fadeIn`, `pop`) for smooth UX
- `useCallback` in hooks to prevent unnecessary re-renders
