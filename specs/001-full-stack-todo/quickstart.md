# Quickstart: Phase II - Basic Full Stack Todo Features

## Prerequisites

- Python 3.11+
- Node.js 18+
- Neon PostgreSQL connection string (or local Postgres)

## Environment Variables

### Backend (`backend/.env`)
```bash
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
SECRET_KEY=your_super_secret_key_for_jwt_signing
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
```

### Frontend (`frontend/.env.local`)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Setup & Run

### Backend

1. Navigate to backend: `cd backend`
2. Create venv: `python -m venv venv`
3. Activate: `.\venv\Scripts\Activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
4. Install: `pip install -r requirements.txt`
5. Run: `uvicorn app.main:app --reload`
6. API Docs at: `http://localhost:8000/docs`

### Frontend

1. Navigate to frontend: `cd frontend`
2. Install: `npm install`
3. Run: `npm run dev`
4. App at: `http://localhost:3000`

## Testing

- Backend: `pytest` (in `backend/`)
- Frontend: `npm test` (in `frontend/`)
