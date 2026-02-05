# Implementation Plan: Phase II - Basic Full Stack Todo Features

**Branch**: `001-phase-ii` | **Date**: 2026-01-04 | **Spec**: [specs/001-full-stack-todo/spec.md](specs/001-full-stack-todo/spec.md)
**Input**: Feature specification from `specs/001-full-stack-todo/spec.md`

## Summary

This plan outlines the technical implementation for Phase II of the Full Stack Todo App. It involves building a Next.js frontend for user interaction (Auth, Todo management) and enhancing the existing Python/FastAPI backend to support data persistence with Neon Serverless PostgreSQL and user authentication via Better Auth. The frontend and backend will communicate via a REST API, ensuring strict data isolation per user.

## Technical Context

**Language/Version**: 
- Backend: Python 3.11+
- Frontend: Node.js 18+ (TypeScript 5.x)
**Primary Dependencies**: 
- Backend: FastAPI, SQLModel, Pydantic, python-jose (for JWT), asyncpg/psycopg2-binary
- Frontend: Next.js 14 (App Router), React 18, Tailwind CSS, better-auth/react (or standard fetch with auth headers if library not available), lucide-react (icons)
**Storage**: Neon Serverless PostgreSQL (Production/Dev), SQLite (Local Dev fallback if Neon not reachable, but plan mandates Neon)
**Testing**: 
- Backend: pytest, pytest-asyncio
- Frontend: Jest, React Testing Library
**Target Platform**: Web (Responsive Desktop & Mobile)
**Project Type**: Full-stack Web Application
**Performance Goals**: < 200ms API response, < 1.5s LCP on frontend
**Constraints**: No AI/Agents, No background jobs, No simplified auth flow (must use Better Auth)
**Scale/Scope**: Single-user isolation, basic todo CRUD

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Phase-Governed Development**: ✅ Phase II goal (Full Stack Web App) aligns with Constitution Phase II definition.
- **Technology Isolation**: ✅ Technologies chosen (Next.js, FastAPI, Neon, Better Auth ,jwt) matches Phase II Technology Matrix.
- **Incremental Validity**: ✅ Plan delivers a fully functional independent application.
- **API-First Design**: ✅ Plan prioritizes API contract definition before frontend implementation.
- **Test Discipline**: ✅ Testing frameworks (pytest, Jest) included in context.
- **Minimal Complexity**: ✅ YAGNI applied (no complex state management libraries like Redux, simple Context/Hooks sufficient).
- **Observability**: ✅ Backend logging requirement acknowledged.

## Project Structure

### Documentation (this feature)

```text
specs/001-full-stack-todo/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (OpenAPI spec)
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── api/
│   │   ├── routes/      # Todo and Auth routes
│   │   └── deps.py      # Dependency injection (DB, Current User)
│   ├── core/
│   │   ├── config.py    # Env vars (DB_URL, SECRET)
│   │   └── security.py  # JWT verification helpers
│   ├── db/
│   │   ├── session.py   # Database connection (Neon)
│   │   └── base.py      # SQLModel registry
│   ├── models/
│   │   ├── user.py      # User SQLModel
│   │   └── todo.py      # Todo SQLModel
│   └── main.py          # App entrypoint
└── tests/
    ├── conftest.py
    └── api/

frontend/
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── (auth)/      # Auth layout group
│   │   │   ├── signin/
│   │   │   └── signup/
│   │   ├── (dashboard)/ # Protected layout group
│   │   │   ├── page.tsx # Todo List View
│   │   │   └── layout.tsx # Auth check wrapper
│   │   └── layout.tsx   # Root layout
│   ├── components/
│   │   ├── ui/          # Reusable UI components
│   │   ├── forms/       # Signup/Signin/Todo forms
│   │   └── todo/        # TodoItem, TodoList components
│   ├── lib/
│   │   ├── api.ts       # Fetch wrapper with Auth token
│   │   ├── auth.ts      # Auth state management (Context/Hook)
│   │   └── utils.ts
│   └── types/           # TS Interfaces (User, Todo)
└── tests/
```

**Structure Decision**: Standard "Monorepo-style" directory structure with distinct `backend` and `frontend` folders at root level to maintain separation of concerns while keeping full-stack context together.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | | |