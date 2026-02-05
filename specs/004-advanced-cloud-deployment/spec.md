# Feature Specification: Phase V - Advanced Cloud Deployment

**Feature Branch**: `004-phase-v`
**Created**: 2026-02-05
**Status**: Draft
**Input**: Phase 5 PDF - Advanced Features, Dapr, Kafka, and Cloud Deployment.

## User Scenarios & Testing

### User Story 1 - Recurring Tasks (Priority: P1)

As a user, I want to set a task to repeat (Daily, Weekly, Monthly) so that the system automatically creates the next occurrence when I complete the current one.

**Why this priority**: Automates manual effort for routine tasks, a core advanced feature.

**Independent Test**:
- Create a task with "Daily" recurrence.
- Mark it as "Complete".
- Verify a new task with the same title is created for the next day.

**Acceptance Scenarios**:
1. **Given** a task with a recurrence rule, **When** it is marked complete, **Then** a "task-completed" event is published to Kafka.
2. **Given** a "task-completed" event for a recurring task, **When** the Recurring Task Service consumes it, **Then** it calculates the next due date and creates a new task.

---

### User Story 2 - Due Dates & Reminders (Priority: P1)

As a user, I want to set a due date for my tasks and receive notifications at the scheduled time.

**Why this priority**: Essential for time-sensitive task management.

**Independent Test**:
- Create a task with a due date 1 minute from now.
- Wait 1 minute.
- Verify a notification event is generated/received.

**Acceptance Scenarios**:
1. **Given** a task with a due date, **When** the task is created, **Then** a reminder is scheduled via Dapr Cron/Jobs API.
2. **Given** a scheduled reminder time is reached, **When** Dapr triggers the callback, **Then** the Notification Service sends a reminder to the user.

---

### User Story 3 - Search, Filter, and Sort (Priority: P2)

As a user with many tasks, I want to search by keyword, filter by priority or tags, and sort by due date.

**Why this priority**: Improves usability for power users.

**Independent Test**:
- Search for a specific word in titles.
- Filter list by "High" priority.
- Sort by "Due Date" ascending.

**Acceptance Scenarios**:
1. **Given** multiple tasks, **When** a user searches for "Buy", **Then** only tasks containing "Buy" are displayed.
2. **Given** tasks with different priorities, **When** the "High" filter is applied, **Then** only High priority tasks are shown.

---

### User Story 4 - Audit Log & Activity History (Priority: P3)

As a system admin, I want to see a history of all actions (Create, Update, Delete) performed on tasks.

**Why this priority**: Ensures data integrity and accountability.

**Independent Test**:
- Perform 3 different task operations.
- Check the Audit Service database/log.
- Verify all 3 actions are recorded with timestamps.

**Acceptance Scenarios**:
1. **Given** any task operation, **When** the operation completes, **Then** an event is published to the `task-events` Kafka topic.
2. **Given** an event in `task-events`, **When** the Audit Service consumes it, **Then** it persists the event details to the activity log.

---

### User Story 5 - Real-time Sync (Priority: P2)

As a user with multiple tabs or devices, I want my task list to update instantly when a change is made elsewhere.

**Why this priority**: Modern UX expectation for multi-device usage.

**Independent Test**:
- Open two browser tabs with the same account.
- Add a task in Tab 1.
- Verify Tab 2 updates automatically without refresh.

**Acceptance Scenarios**:
1. **Given** a task change, **When** the change is saved, **Then** a `task-updates` event is broadcast via WebSockets (facilitated by Kafka/Dapr).

## Requirements

### Functional Requirements

#### Advanced Task Logic
- **FR-001**: Support `priority` field (Low, Medium, High).
- **FR-002**: Support `tags` (List of strings).
- **FR-003**: Support `due_date` and `reminder_time`.
- **FR-004**: Support `recurrence` rules (None, Daily, Weekly, Monthly).

#### Event-Driven Architecture (Kafka/Dapr)
- **FR-005**: System MUST use Dapr Pub/Sub abstraction for Kafka communication.
- **FR-006**: System MUST publish events for: `task-created`, `task-updated`, `task-deleted`, `task-completed`.
- **FR-007**: System MUST use Dapr Jobs API or Cron Bindings for scheduling reminders.
- **FR-008**: System MUST use Dapr Service Invocation for inter-service communication.

#### Distributed Services
- **FR-009**: **Recurring Task Service**: Consumes `task-completed` events and creates new task instances.
- **FR-010**: **Notification Service**: Consumes reminder triggers and sends notifications.
- **FR-011**: **Audit Service**: Consumes all `task-events` and stores them in a separate audit log.

#### Cloud Deployment (GKE/AKS)
- **FR-012**: Application MUST be deployable to Google Cloud (GKE) or Azure (AKS).
- **FR-013**: Deployment MUST be automated via GitHub Actions (CI/CD).
- **FR-014**: System MUST use Kubernetes Secrets (via Dapr) for sensitive data.

### Key Entities (Extended)

- **Todo**:
    - `priority`: Enum (Low, Medium, High)
    - `due_date`: Timestamp (Optional)
    - `tags`: JSON/Array of strings
    - `recurrence`: Enum (None, Daily, Weekly, Monthly)
    - `parent_id`: ID (For recurring task links)

- **AuditLog**:
    - `id`: Unique Identifier
    - `event_type`: String (Created, Updated, etc.)
    - `task_id`: ID
    - `user_id`: ID
    - `payload`: JSON (State of task at that time)
    - `timestamp`: Timestamp

## Success Criteria

- **SC-001**: Application is live on Google Cloud (GKE) or Azure (AKS).
- **SC-002**: Recurring tasks automatically spawn new occurrences.
- **SC-003**: Reminders trigger at the exact scheduled time without manual polling.
- **SC-004**: Audit log captures 100% of task operations via Kafka events.
- **SC-005**: CI/CD pipeline automatically deploys changes to the cloud cluster.

## Clarifications (Phase V)

- Q: Should we use Redpanda Cloud or self-hosted? → A: Use Redpanda (Docker) for local and Redpanda Cloud (Free Tier) or Strimzi (Self-hosted) for Cloud.
- Q: Which Cloud provider is preferred? → A: Google Cloud (GKE) is recommended due to $300 free credits.
- Q: Is WebSocket mandatory? → A: Yes, for real-time sync across clients.
