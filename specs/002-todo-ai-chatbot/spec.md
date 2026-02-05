# Feature Specification: Todo AI Chatbot

**Feature Branch**: `002-todo-ai-chatbot`  
**Created**: 2026-01-08  
**Status**: Draft  
**Input**: Create an AI-powered chatbot interface for managing todos through natural language using MCP (Model Context Protocol) server architecture.

## Clarifications

### Session 2026-01-08
- Q: Where should the ChatKit interface be integrated? → A: Dedicated Page (`/dashboard/chat`).
- Q: How should conversation history be retrieved for context? → A: Sliding Window (most recent N messages).
- Q: How should task deletion be handled? → A: Hard Delete (permanent removal).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Natural Language Task Creation (Priority: P1)

Users should be able to navigate to `/dashboard/chat` and create tasks by describing them in natural language in the chat interface.

**Why this priority**: Core value proposition of the AI chatbot.

**Independent Test**: Send a message "Remind me to call John tomorrow" and verify a task is created with title "Call John" and appropriate details.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they type "Add a task to buy groceries", **Then** the bot confirms "Added task 'Buy groceries'" and the task exists in the database.
2. **Given** a user, **When** they type "I need to finish the report by Friday", **Then** a task "Finish report" is created.

---

### User Story 2 - Task Retrieval and Filtering (Priority: P1)

Users should be able to ask what tasks they have, optionally filtering by status (pending/completed).

**Why this priority**: Essential for managing existing workload.

**Independent Test**: Create 2 pending and 1 completed task, then ask "What do I have left to do?" and verify only pending tasks are listed.

**Acceptance Scenarios**:

1. **Given** tasks exist, **When** user types "Show me all my tasks", **Then** the bot lists all tasks.
2. **Given** tasks exist, **When** user types "What is pending?", **Then** the bot lists only incomplete tasks.
3. **Given** tasks exist, **When** user types "What have I completed?", **Then** the bot lists only completed tasks.

---

### User Story 3 - Task Updates and Completion (Priority: P2)

Users should be able to modify tasks or mark them as complete using natural language.

**Why this priority**: completes the basic CRUD cycle for daily usage.

**Independent Test**: Ask to "Mark the grocery task as done" and verify the status updates to completed.

**Acceptance Scenarios**:

1. **Given** a task "Buy milk", **When** user types "I bought the milk", **Then** the bot marks the task as completed.
2. **Given** a task "Meeting", **When** user types "Rename the meeting task to 'Team Sync'", **Then** the task title is updated.

---

### User Story 4 - Task Deletion (Priority: P3)

Users should be able to remove tasks they no longer need permanently from the system.

**Why this priority**: Important for cleanup but less frequent than completion.

**Independent Test**: Ask to "Delete the old meeting task" and verify it is permanently removed from the database.

**Acceptance Scenarios**:

1. **Given** a task, **When** user types "Delete the task about running", **Then** the task is permanently deleted and bot confirms.

---

### User Story 5 - Persistent Conversation Context (Priority: P2)

The chatbot should remember the conversation history across requests (persisted in DB), allowing for context-aware follow-ups.

**Why this priority**: Enables natural conversation flow (e.g., "Delete *that* task").

**Independent Test**: Send "List my tasks", then "Delete the first one". The bot should know which task was "first".

**Acceptance Scenarios**:

1. **Given** user just listed tasks, **When** user says "Delete the first one", **Then** the bot correctly identifies the task from previous context and deletes it.
2. **Given** a conversation history, **When** user refreshes the page, **Then** the previous chat messages are still visible.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST expose a `POST /api/{user_id}/chat` endpoint that accepts a message and returns an AI response.
- **FR-002**: System MUST use OpenAI Agents SDK to process natural language.
- **FR-003**: System MUST implement an MCP (Model Context Protocol) Server exposing the following tools: `add_task`, `list_tasks`, `complete_task`, `delete_task`, `update_task`.
- **FR-004**: System MUST persist all chat messages (user and assistant) to the `messages` table in the database.
- **FR-005**: System MUST persist conversation sessions in the `conversations` table.
- **FR-006**: The backend MUST be stateless; every request must rebuild context from the database history using a sliding window of the most recent N messages to balance context and token efficiency.
- **FR-007**: AI Agent MUST be able to chain multiple tools in a single turn (e.g., list then delete).
- **FR-008**: System MUST authenticate all chat requests using Better Auth.

### Key Entities

- **Task**: Todo item (existing).
- **Conversation**: Represents a chat session (`id`, `user_id`, `created_at`, `updated_at`).
- **Message**: Individual chat message (`id`, `conversation_id`, `role`, `content`, `created_at`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can successfully perform all 5 CRUD operations (Add, List, Update, Complete, Delete) using only natural language.
- **SC-002**: Chatbot responds to queries within 3 seconds (p95) for standard requests.
- **SC-003**: Conversation history is accurately restored 100% of the time upon page reload.
- **SC-004**: 90% of vague user commands (e.g., "finish it") are correctly interpreted given conversation context.

## Assumptions

- User has a valid OpenAI API Key configured in the environment.
- The `phase3.pdf` database schema for Conversations/Messages is sufficient.
- The existing Next.js frontend can integrate with OpenAI ChatKit components.