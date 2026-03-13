# ProtocolAI — Onboarding Prototype

Multi-agent platform onboarding website. React frontend + FastAPI backend.

---

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
# Runs on http://localhost:8000
# Docs at http://localhost:8000/docs
```

### Frontend
```bash
cd frontend
npm create vite@latest . -- --template react
# Replace src/App.jsx with the provided App.jsx
# Replace src/main.jsx with:
#   import React from 'react'
#   import ReactDOM from 'react-dom/client'
#   import App from './App.jsx'
#   ReactDOM.createRoot(document.getElementById('root')).render(<App />)
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## Onboarding Flow (4 steps)

1. **Company** — name, industry, description, target audience, brand tone
2. **Contact** — name, email, role, phone
3. **Modules** — select AI agents (website, ads, chatbot, voice)
4. **Review** — confirm everything, submit

On submit → `POST /onboarding/submit` → returns `tenant_id` + dashboard URL

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Health check |
| GET | `/health` | Status + tenant count |
| POST | `/onboarding/submit` | Submit onboarding form |
| GET | `/onboarding/tenant/{id}` | Get tenant by ID |
| GET | `/onboarding/industries` | Industry options |
| GET | `/onboarding/modules` | Agent module options |

---

## Next Steps (post-prototype)

- [ ] Replace in-memory store with Supabase
- [ ] Add Clerk auth (org accounts)
- [ ] Wire Celery task for skill.md initialization
- [ ] Add Stripe billing on module selection
- [ ] Add file upload for protocol documents
- [ ] Email confirmation on successful onboarding
