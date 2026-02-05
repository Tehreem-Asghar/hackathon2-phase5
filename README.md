# Full Stack Todo App

A full-stack Todo application with FastAPI backend and Next.js frontend.

## Project Structure

- `backend/`: FastAPI application (Python)
- `frontend/`: Next.js application (TypeScript/React)
- `specs/`: Project specifications and documentation

## Quickstart

For detailed setup instructions, see [specs/001-full-stack-todo/quickstart.md](specs/001-full-stack-todo/quickstart.md).

### Backend

1. Navigate to `backend/`
2. Create and activate virtual environment
3. Install dependencies: `pip install -r requirements.txt`
4. Create `.env` file (see `quickstart.md`)
5. Run server: `uvicorn app.main:app --reload`

### Frontend

1. Navigate to `frontend/`
2. Install dependencies: `npm install`
3. Create `.env.local` file (see `quickstart.md`)
4. Run development server: `npm run dev`

## Features

- User Authentication (Signup/Signin)
- Create, Read, Update, Delete Todos
- Responsive UI
- Secure API
