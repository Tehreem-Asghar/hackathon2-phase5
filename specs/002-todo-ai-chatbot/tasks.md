---
description: "Task list for Todo AI Chatbot implementation"
---

# Tasks: Todo AI Chatbot

**Input**: Design documents from `specs/002-todo-ai-chatbot/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Install backend dependencies (openai-agents-sdk, mcp) in backend/requirements.txt
- [X] T002 Install frontend dependencies (ai, lucide-react) in frontend/package.json
- [X] T003 [P] Create backend/app/agents/ directory structure
- [X] T004 [P] Create frontend/src/app/(dashboard)/chat/ directory structure

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Create Conversation model in backend/app/models/conversation.py
- [X] T006 Create Message model in backend/app/models/message.py
- [X] T007 Register new models in backend/app/models/__init__.py and generate Alembic migrations
- [X] T008 Implement MCP Tools (add_task, list_tasks, etc.) in backend/app/agents/tools.py
- [X] T009 Create Chat Pydantic schemas in backend/app/schemas/chat.py
- [X] T010 Setup basic Agent definition with Tools in backend/app/agents/todo_agent.py
- [X] T011 Implement basic stateless Chat Endpoint in backend/app/api/routes/chat.py
- [X] T012 Register chat router in backend/app/main.py
- [X] T013 Create Frontend API client for chat in frontend/src/lib/chat-api.ts

**Checkpoint**: Foundation ready - DB tables exist, Agent/Tools are defined, Endpoint is reachable.

---

## Phase 3: User Story 1 - Natural Language Task Creation (Priority: P1)

**Goal**: Users can create tasks by describing them in natural language in the chat interface.

**Independent Test**: Send "Buy milk" to `/api/chat`, verify task created in DB.

### Tests for User Story 1 (Requested by Constitution) ⚠️

- [X] T014 [P] [US1] Create integration test for creating task via chat in backend/tests/api/test_chat.py

### Implementation for User Story 1

- [X] T015 [US1] Implement `add_task` logic in backend/app/agents/tools.py (if not fully implemented in T008)
- [X] T016 [US1] Implement basic Chat UI page in frontend/src/app/(dashboard)/chat/page.tsx
- [X] T017 [US1] Create ChatInterface component in frontend/src/components/chat/ChatInterface.tsx
- [X] T018 [US1] Connect Chat UI to backend API in frontend/src/app/(dashboard)/chat/page.tsx

**Checkpoint**: User can type "Add task X" and see it confirmed.

---

## Phase 4: User Story 2 - Task Retrieval and Filtering (Priority: P1)

**Goal**: Users can list tasks and filter them (pending/completed).

**Independent Test**: Send "List pending tasks", verify correct JSON response.

### Tests for User Story 2

- [X] T019 [P] [US2] Add test case for listing tasks in backend/tests/api/test_chat.py

### Implementation for User Story 2

- [X] T020 [US2] Implement `list_tasks` logic with filtering in backend/app/agents/tools.py
- [X] T021 [US2] Enhance Agent instructions to handle "What do I have?" queries in backend/app/agents/todo_agent.py

**Checkpoint**: User can ask "What's pending?" and get a list.

---

## Phase 5: User Story 3 - Task Updates and Completion (Priority: P2)

**Goal**: Users can update tasks or mark them as complete.

**Independent Test**: Send "Mark task X as done", verify status update.

### Tests for User Story 3

- [X] T022 [P] [US3] Add test case for completing task in backend/tests/api/test_chat.py
- [X] T023 [P] [US3] Add test case for updating task title in backend/tests/api/test_chat.py

### Implementation for User Story 3

- [X] T024 [US3] Implement `complete_task` logic in backend/app/agents/tools.py
- [X] T025 [US3] Implement `update_task` logic in backend/app/agents/tools.py
- [X] T026 [US3] Tune Agent to handle "Mark it as done" (requires context from US5, but basic ID-based works here)

**Checkpoint**: User can update/complete tasks by ID or clear description.

---

## Phase 6: User Story 5 - Persistent Conversation Context (Priority: P2)

**Goal**: Chatbot remembers conversation history across requests.

**Independent Test**: Send "List tasks", then "Delete the first one".

### Tests for User Story 5

- [X] T027 [P] [US5] Add test case for multi-turn context (List -> Delete) in backend/tests/api/test_chat.py

### Implementation for User Story 5

- [X] T028 [US5] Implement history retrieval (Sliding Window) in backend/app/api/routes/chat.py
- [X] T029 [US5] Update Chat Endpoint to save new messages to DB in backend/app/api/routes/chat.py
- [X] T030 [US5] Frontend: Ensure chat history is loaded on mount in frontend/src/app/(dashboard)/chat/page.tsx

**Checkpoint**: History persists after refresh; Contextual commands work.

---

## Phase 7: User Story 4 - Task Deletion (Priority: P3)

**Goal**: Users can permanently remove tasks.

**Independent Test**: Send "Delete task X", verify DB removal.

### Tests for User Story 4

- [X] T031 [P] [US4] Add test case for deleting task in backend/tests/api/test_chat.py

### Implementation for User Story 4

- [X] T032 [US4] Implement `delete_task` logic (Hard Delete) in backend/app/agents/tools.py

**Checkpoint**: User can delete tasks.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T033 [P] Add MessageBubble component for better styling in frontend/src/components/chat/MessageBubble.tsx
- [ ] T034 [P] Optimize sliding window size (configure N=20) in backend/app/core/config.py
- [ ] T035 [P] Add loading states/skeletons to Chat Interface
- [ ] T036 Run full integration test suite

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup. BLOCKS all user stories.
- **User Stories (Phase 3-7)**: All depend on Foundational.
  - US1 and US2 are P1 (MVP).
  - US5 and US3 are P2 (Context & Updates).
  - US4 is P3 (Deletion).

### Implementation Strategy

1. **MVP**: Complete Phases 1, 2, 3, and 4. (Basic Chat + Add + List).
2. **Context**: Complete Phase 6. (Enables better flow).
3. **Full CRUD**: Complete Phases 5 and 7.
4. **Polish**: Phase 8.
