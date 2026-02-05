# Implementation Tasks: Phase II - Basic Full Stack Todo Features

**Branch**: `001-phase-ii` | **Spec**: [specs/001-full-stack-todo/spec.md](specs/001-full-stack-todo/spec.md) | **Plan**: [specs/001-full-stack-todo/plan.md](specs/001-full-stack-todo/plan.md)

## Backend Tasks

- [x] **BE-001**: Initialize Backend Project
  - **Description**: Set up Python virtual environment, install FastAPI, Uvicorn, SQLModel, Pydantic, python-jose, passlib, asyncpg. Create basic directory structure (`app/api`, `app/core`, `app/db`, `app/models`).
  - **Preconditions**: Python 3.11+ installed.
  - **Outcome**: Runnable FastAPI app with "Hello World" endpoint.
  - **Artifacts**: `backend/requirements.txt`, `backend/app/main.py`
  - **Reference**: Plan > Project Structure

- [x] **BE-002**: Configure Database Connection
  - **Description**: Setup `app/db/session.py` to connect to Neon PostgreSQL using `DATABASE_URL` env var. Implement `get_session` dependency.
  - **Preconditions**: BE-001, Neon DB URL available.
  - **Outcome**: Database connection established and verified.
  - **Artifacts**: `backend/app/db/session.py`, `backend/app/core/config.py`
  - **Reference**: Plan > Technical Context > Storage

- [x] **BE-003**: Implement User Data Model
  - **Description**: Create `User` SQLModel in `app/models/user.py` matching the Data Model spec (id, email, password_hash, timestamps). Run migration/creation script.
  - **Preconditions**: BE-002.
  - **Outcome**: User table created in DB.
  - **Artifacts**: `backend/app/models/user.py`
  - **Reference**: Spec > Key Entities > User

- [x] **BE-004**: Implement Todo Data Model
  - **Description**: Create `Todo` SQLModel in `app/models/todo.py` with Foreign Key to User. Match constraints (title max 255).
  - **Preconditions**: BE-003.
  - **Outcome**: Todo table created in DB with relation.
  - **Artifacts**: `backend/app/models/todo.py`
  - **Reference**: Spec > Key Entities > Todo

- [x] **BE-005**: Implement Authentication Service
  - **Description**: Create `app/api/routes/auth.py`. Implement `/signup` (hash password, save user) and `/signin` (verify password, issue JWT).
  - **Preconditions**: BE-003.
  - **Outcome**: Users can register and login, receiving a JWT token.
  - **Artifacts**: `backend/app/api/routes/auth.py`, `backend/app/core/security.py`
  - **Reference**: Spec > Functional Requirements > Authentication

- [x] **BE-006**: Implement Auth Middleware
  - **Description**: Create `get_current_user` dependency in `app/api/deps.py`. Decode JWT from Bearer header, validate expiration, fetch user.
  - **Preconditions**: BE-005.
  - **Outcome**: Routes using this dependency reject unauthenticated requests (401).
  - **Artifacts**: `backend/app/api/deps.py`
  - **Reference**: Spec > Functional Requirements > FR-003

- [x] **BE-007**: Implement Todo CRUD Endpoints
  - **Description**: Create `app/api/routes/todos.py`. Implement `GET /`, `POST /`, `GET /{id}`, `PUT /{id}`, `DELETE /{id}`. Use Pydantic schemas for validation.
  - **Preconditions**: BE-004, BE-006.
  - **Outcome**: Full CRUD operations available via API.
  - **Artifacts**: `backend/app/api/routes/todos.py`, `backend/app/schemas/`
  - **Reference**: Spec > Functional Requirements > Backend

- [x] **BE-008**: User-scoped Data Access Enforcement
  - **Description**: Modify/Ensure all Todo endpoints filter by `current_user.id`. `GET` returns only own todos. `PUT/DELETE` checks ownership before action.
  - **Preconditions**: BE-007.
  - **Outcome**: User A cannot access/modify User B's todos.
  - **Artifacts**: `backend/app/api/routes/todos.py`
  - **Reference**: Spec > Success Criteria > SC-004

- [x] **BE-009**: Backend Error Handling
  - **Description**: Implement global exception handlers for validation errors, auth errors, and 404s to ensure JSON responses.
  - **Preconditions**: BE-007.
  - **Outcome**: Consistent JSON error responses.
  - **Artifacts**: `backend/app/main.py`
  - **Reference**: Plan > Summary > Error handling

## Frontend Tasks

- [x] **FE-001**: Initialize Next.js Project
  - **Description**: Create Next.js app (`npx create-next-app`) with TypeScript, Tailwind CSS. Setup directory structure (`src/components`, `src/lib`).
  - **Preconditions**: Node.js installed.
  - **Outcome**: Running Next.js app.
  - **Artifacts**: `frontend/package.json`, `frontend/tsconfig.json`
  - **Reference**: Plan > Project Structure

- [x] **FE-002**: Authentication Pages
  - **Description**: Build `/signup` and `/signin` pages. Create forms using React Hook Form (or simple state). Call backend Auth API.
  - **Preconditions**: FE-001, BE-005.
  - **Outcome**: Users can submit signup/login forms.
  - **Artifacts**: `frontend/src/app/(auth)/signup/page.tsx`, `frontend/src/app/(auth)/signin/page.tsx`
  - **Reference**: Spec > User Story 1

- [x] **FE-003**: Auth State Handling
  - **Description**: Implement `AuthProvider` context. Store JWT in localStorage/cookie. Handle login success (redirect), logout (clear token), and initial load check.
  - **Preconditions**: FE-002.
  - **Outcome**: App knows if user is logged in.
  - **Artifacts**: `frontend/src/lib/auth.tsx`
  - **Reference**: Spec > Functional Requirements > FR-011

- [x] **FE-004**: Todo List Page
  - **Description**: Build Dashboard page. Fetch todos from `GET /api/todos` using the auth token. Display list of `TodoItem` components.
  - **Preconditions**: FE-003, BE-008.
  - **Outcome**: Authenticated users see their todos.
  - **Artifacts**: `frontend/src/app/(dashboard)/page.tsx`
  - **Reference**: Spec > User Story 3

- [x] **FE-005**: Add Todo UI
  - **Description**: Add "Create Todo" button/form to Dashboard. Call `POST /api/todos`. Refresh list on success.
  - **Preconditions**: FE-004.
  - **Outcome**: Users can add new todos.
  - **Artifacts**: `frontend/src/components/forms/AddTodoForm.tsx`
  - **Reference**: Spec > User Story 2

- [x] **FE-006**: Edit Todo UI
  - **Description**: Implement Edit functionality (inline or modal). Pre-fill data. Call `PUT /api/todos/{id}`.
  - **Preconditions**: FE-004.
  - **Outcome**: Users can update todo title/description.
  - **Artifacts**: `frontend/src/components/forms/EditTodoForm.tsx`
  - **Reference**: Spec > User Story 4

- [x] **FE-007**: Delete Todo UI
  - **Description**: Add Delete button to TodoItem. Call `DELETE /api/todos/{id}`. Remove item from list UI.
  - **Preconditions**: FE-004.
  - **Outcome**: Users can delete todos.
  - **Artifacts**: `frontend/src/components/todo/TodoItem.tsx`
  - **Reference**: Spec > User Story 5

- [x] **FE-008**: Toggle Todo Completion
  - **Description**: Add Checkbox to TodoItem. Call `PATCH /api/todos/{id}/complete` (or PUT). Update UI state visually (strikethrough).
  - **Preconditions**: FE-004.
  - **Outcome**: Users can mark tasks done.
  - **Artifacts**: `frontend/src/components/todo/TodoItem.tsx`
  - **Reference**: Spec > User Story 6

- [x] **FE-009**: Responsive Layout & Error States
  - **Description**: Ensure UI works on mobile (stack columns). Add Loading spinners and Empty State ("No todos yet"). Handle API errors (toast notifications).
  - **Preconditions**: FE-004.
  - **Outcome**: Polished, responsive UI with feedback.
  - **Artifacts**: `frontend/src/app/globals.css`, `frontend/src/components/ui/`
  - **Reference**: Spec > FR-009

## Integration Tasks

- [x] **INT-001**: Frontend-Backend API Integration
  - **Description**: Configure CORS in FastAPI. Set `NEXT_PUBLIC_API_URL`. Ensure `fetch` wrapper attaches `Authorization: Bearer <token>` to all requests.
  - **Preconditions**: BE-006, FE-003.
  - **Outcome**: Frontend successfully talks to Backend.
  - **Artifacts**: `backend/app/main.py` (CORS), `frontend/.env.local`
  - **Reference**: Plan > Integration Plan

- [x] **INT-002**: Local Development Configuration
  - **Description**: Add `dev` scripts to `package.json` (root or separate) or document how to run both servers.
  - **Preconditions**: All Tasks.
  - **Outcome**: Documented "How to Run" for developer.
  - **Artifacts**: `README.md` (Update), `specs/quickstart.md` (Verify)
  - **Reference**: Plan > Local development setup
