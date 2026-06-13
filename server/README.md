# FinFlow — Personal Finance Manager (MERN Stack)

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React 18, TailwindCSS, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| PDF Export | jsPDF + jspdf-autotable |
| API Testing | Postman |

---

## Project Structure
```
finflow/           ← React frontend
  src/
    context/       ← AuthContext (JWT session)
    hooks/         ← useExpenses (API calls)
    services/      ← api.js (all fetch calls)
    pages/         ← Dashboard, Expenses, Income, Budget, Goals, Reports, Profile
    components/    ← Shared UI components

finflow-server/    ← Express + MongoDB backend
  models/          ← User, Expense, Income, Budget, Goal
  routes/          ← auth, expenses, incomes, budgets, goals
  middleware/      ← JWT auth middleware
  config/          ← MongoDB connection
  server.js        ← Entry point
```

---

## Setup & Run

### 1. Backend
```bash
cd finflow-server

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env and set your MONGODB_URI and JWT_SECRET

# Start dev server (with nodemon)
npm run dev

# API runs on: http://localhost:5000
```

### 2. Frontend
```bash
cd finflow

# Install dependencies
npm install

# Start React dev server
npm start

# Opens on: http://localhost:3000
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/signup | Register new user |
| POST | /api/auth/login | Login → returns JWT token |
| POST | /api/auth/reset-password | Reset password by email |
| GET | /api/auth/profile | Get logged-in user profile |
| PUT | /api/auth/profile | Update profile + preferences |

### Expenses (all require Bearer token)
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/expenses | Get all expenses (supports ?category, ?dateFrom, ?dateTo, ?search) |
| POST | /api/expenses | Add new expense |
| DELETE | /api/expenses/:id | Delete single expense |
| DELETE | /api/expenses/all | Clear all expenses |

### Incomes
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/incomes | Get all incomes |
| POST | /api/incomes | Add income |
| DELETE | /api/incomes/:id | Delete income |

### Budgets
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/budgets | Get all budgets |
| POST | /api/budgets | Create/update budget |
| DELETE | /api/budgets/:id | Delete budget |

### Goals
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/goals | Get all goals |
| POST | /api/goals | Create goal |
| PUT | /api/goals/:id | Update goal progress |
| DELETE | /api/goals/:id | Delete goal |

---

## Deployment

### Backend → Render
1. Push `finflow-server/` to GitHub
2. Go to render.com → New Web Service
3. Connect repo, set:
   - Build command: `npm install`
   - Start command: `npm start`
4. Add environment variables (MONGODB_URI, JWT_SECRET, CLIENT_URL)

### Frontend → Netlify
1. In `finflow/.env`, change `REACT_APP_API_URL` to your Render backend URL
2. Run `npm run build`
3. Drag `build/` folder to Netlify OR connect GitHub repo with:
   - Build command: `npm run build`
   - Publish directory: `build`

---

## Testing with Postman
Import `FinFlow.postman_collection.json` into Postman.
The Login request auto-saves the token — all protected routes use `{{token}}` automatically.
