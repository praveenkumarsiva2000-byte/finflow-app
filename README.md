# Cashlyne — MERN Stack Personal Finance Manager

## Folder Structure
```
cashlyne-app/
├── client/        ← React frontend (TailwindCSS, Recharts, jsPDF)
├── server/        ← Node.js + Express + MongoDB backend
└── package.json   ← Root scripts to run both together
```

## Quick Start

### Step 1 — Install all dependencies
```bash
npm run install-all
```

### Step 2 — Configure backend environment
```bash
cd server
cp .env.example .env
# Open .env and set your MONGODB_URI and JWT_SECRET
cd ..
```

### Step 3 — Run both servers together
```bash
npm run dev
```
- Frontend → http://localhost:3000
- Backend  → http://localhost:5000

---

## Demo Credentials

To try the app without signing up, seed a demo account (run once, after `MONGODB_URI` is configured):
```bash
cd server
npm run seed
```

Then log in with:
| Field    | Value               |
|----------|---------------------|
| Email    | `guest@cashlyne.app` |
| Password | `Guest@2026`         |

---

## Deploy
- **Backend** → [Render](https://render.com) — connect `server/` folder
- **Frontend** → [Netlify](https://netlify.com) — connect `client/` folder, build command: `npm run build`, publish dir: `build`
- Update `client/.env` with your Render backend URL before deploying frontend
