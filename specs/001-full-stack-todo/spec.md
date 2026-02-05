# Feature Specification: Phase II - Basic Full Stack Todo Features

**Feature Branch**: `001-phase-ii`
**Created**: 2026-01-04
**Status**: Draft
**Input**: User description: "Implement all 5 Basic Level Todo features as a full-stack web application."

## User Scenarios & Testing

### User Story 1 - User Authentication (Priority: P1)

As a user, I want to sign up and sign in to the application so that I can securely manage my private todo list.

**Why this priority**: Foundation for data privacy and user-specific data association. Without auth, the app cannot fulfill the requirement of user-isolated todos.

**Independent Test**:
- Navigate to /signup, create account -> success.
- Navigate to /signin, login with credentials -> success.
- Access protected route without login -> redirect to signin.

**Acceptance Scenarios**:

1. **Given** a new user, **When** they submit valid email/password on Signup page, **Then** a new account is created and they are logged in.
2. **Given** an existing user, **When** they submit valid credentials on Signin page, **Then** they are logged in and redirected to the Todo list.
3. **Given** an authenticated user, **When** they try to access their todos, **Then** they see only their own data.
4. **Given** an unauthenticated user, **When** they try to access the Todo list, **Then** they are redirected to the Signin page.

---

### User Story 2 - Create Todo (Priority: P1)

As an authenticated user, I want to create a new todo item so that I can track my tasks.

**Why this priority**: Core functionality of a Todo app.

**Independent Test**:
- Log in.
- Navigate to "Add Todo".
- Submit form.
- Verify new todo appears in the list.

**Acceptance Scenarios**:

1. **Given** an authenticated user on the Add Todo page, **When** they submit a non-empty title/description, **Then** a new Todo is created in the database and they are redirected to the list view.
2. **Given** a user, **When** they submit an empty title, **Then** an error message is displayed.

---

### User Story 3 - View Todos (Priority: P1)

As an authenticated user, I want to view a list of my todos, sorted by creation date (newest first), so that I can see what I need to accomplish.

**Why this priority**: Essential to verify creation and manage tasks.

**Independent Test**:
- Log in with user A (has todos) and user B (no todos).
- Verify User A sees their todos.
- Verify User B sees empty state.

**Acceptance Scenarios**:

1. **Given** a user with existing todos, **When** they view the Todo list, **Then** all their todos are displayed (title, status), sorted by creation date (newest first).
2. **Given** a user with no todos, **When** they view the Todo list, **Then** a "No todos found" message is displayed.
3. **Given** User A and User B, **When** User A views their list, **Then** they do NOT see User B's todos.

---

### User Story 4 - Update Todo (Priority: P2)

As an authenticated user, I want to edit an existing todo so that I can correct mistakes or update details.

**Why this priority**: Necessary for data maintenance.

**Independent Test**:
- Edit a todo's title.
- Save.
- Verify change persisted.

**Acceptance Scenarios**:

1. **Given** a user viewing a todo, **When** they edit the title and save, **Then** the todo is updated in the database.
2. **Given** a user, **When** they try to edit a todo that doesn't belong to them (via API), **Then** they receive a 404 or 403 error.

---

### User Story 5 - Delete Todo (Priority: P2)

As an authenticated user, I want to delete a todo so that I can remove unwanted items.

**Why this priority**: Necessary for list hygiene.

**Independent Test**:
- Click delete on a todo.
- Verify todo is removed from list and DB.

**Acceptance Scenarios**:

1. **Given** a user on the todo list, **When** they click Delete on a todo, **Then** the todo is removed from the view and database.

---

### User Story 6 - Toggle Complete Status (Priority: P2)

As an authenticated user, I want to mark a todo as complete or incomplete so that I can track my progress.

**Why this priority**: Core status tracking feature.

**Independent Test**:
- Click checkbox on todo.
- Verify status toggles.

**Acceptance Scenarios**:

1. **Given** an incomplete todo, **When** the user clicks "Mark Complete", **Then** the status changes to completed.
2. **Given** a completed todo, **When** the user clicks "Mark Incomplete", **Then** the status changes to incomplete.

---

### Edge Cases

- **Invalid Auth**: Accessing API endpoints with invalid/expired tokens -> 401 Unauthorized.
- **Data Validation**: Creating todo with empty string -> 400 Bad Request.
- **Resource Access**: Accessing/Modifying another user's todo ID -> 403 Forbidden or 404 Not Found.
- **Database Error**: Database down -> 500 Internal Server Error (Generic error message to user).

## Requirements

### Functional Requirements

#### Authentication
- **FR-001**: System MUST allow users to sign up with email/password using Better Auth.
- **FR-002**: System MUST allow users to sign in with email/password using Better Auth.
- **FR-003**: System MUST enforce authentication for all Todo operations (Create, Read, Update, Delete).

#### Backend (API & Data)
- **FR-004**: System MUST provide RESTful API endpoints:
    - `POST /api/todos` (Create)
    - `GET /api/todos` (List)
    - `GET /api/todos/:id` (Retrieve single)
    - `PUT/PATCH /api/todos/:id` (Update content)
    - `DELETE /api/todos/:id` (Delete)
    - `PATCH /api/todos/:id/complete` (Toggle Status - optional, can be part of Update)
- **FR-005**: API MUST use JSON for request and response bodies.
- **FR-006**: System MUST persist data in Neon Serverless PostgreSQL.
- **FR-007**: System MUST associate every todo with the `userId` of the creator.

#### Frontend
- **FR-008**: System MUST be a Next.js web application.
- **FR-009**: UI MUST be responsive (mobile and desktop friendly).
- **FR-010**: Frontend MUST implement pages for: Signup, Signin, List Todos, Add Todo, Edit Todo.
- **FR-011**: Frontend MUST manage authentication state (logged in/out).

### Key Entities

- **User**:
    - `id`: Unique Identifier
    - `email`: String, Unique
    - `password`: Hashed String (managed by Better Auth)
    - `createdAt`: Timestamp
    - `updatedAt`: Timestamp

- **Todo**:
    - `id`: Unique Identifier
    - `userId`: Foreign Key to User
    - `title`: String (Max 255 characters)
    - `description`: String (Optional, Max 1000 characters)
    - `isCompleted`: Boolean (Default: false)
    - `createdAt`: Timestamp
    - `updatedAt`: Timestamp

## Success Criteria

### Measurable Outcomes

- **SC-001**: User can successfully create an account and log in.
- **SC-002**: User can create, read, update, delete, and toggle todos without errors.
- **SC-003**: Data persists across session refreshes (Database storage).
- **SC-004**: User A cannot access User B's todos (Security verification).

## Clarifications

### Session 2026-01-04

- Q: How should the Todo list be sorted? → A: Creation Date (Newest First)
- Q: What are the maximum lengths for Todo title and description? → A: 255 characters for title, 1000 characters for description.
- Q: Is pagination required for the Todo list for Phase II? → A: No pagination - Load all todos at once.
