# Implementation Tasks: Phase V - Advanced Cloud Deployment

**Branch**: `004-phase-v` | **Spec**: [specs/004-advanced-cloud-deployment/spec.md](specs/004-advanced-cloud-deployment/spec.md) | **Plan**: [specs/004-advanced-cloud-deployment/plan.md](specs/004-advanced-cloud-deployment/plan.md)

## Phase 1: Direct Feature Implementation (No Kafka/Dapr)

- [X] **FEAT-101**: Update Todo Model & Schemas
  - **Description**: Add `priority`, `tags`, `due_date`, `recurrence`, and `parent_id` to Backend models and Pydantic schemas.
  - **Artifacts**: `backend/app/models/todo.py`, `backend/app/schemas/todo.py`.

- [X] **FEAT-102**: Implement Search, Filter, and Sort in Backend
  - **Description**: Update `read_todos` endpoint to support query parameters for searching titles, filtering by priority/tags, and sorting by due date or creation date.
  - **Artifacts**: `backend/app/api/routes/todos.py`.

- [X] **FEAT-103**: Implement Recurring Task Logic (Direct)
  - **Description**: Add logic to `complete_todo` to automatically create the next instance if the task is recurring.
  - **Artifacts**: `backend/app/api/routes/todos.py`.

- [X] **FEAT-104**: Implement Due Dates & Basic Reminders
  - **Description**: Add validation for due dates. (Frontend will handle display of overdue tasks).
  - **Artifacts**: `backend/app/api/routes/todos.py`.

- [X] **FEAT-105**: Update Frontend UI for Intermediate/Advanced Features
  - **Description**: Add fields to Task Creation/Edit forms for priority, tags, due date, and recurrence. Add search bar and filter/sort UI.
  - **Artifacts**: `frontend/src/app/todos/page.tsx`, `frontend/src/components/*.tsx`.

## Phase 2: Containerization & Local Kubernetes

- [X] **OPS-201**: Dockerize Frontend and Backend
  - **Description**: Create/Verify Dockerfiles and `docker-compose.yaml` for local container testing.
  - **Artifacts**: `backend/Dockerfile`, `frontend/Dockerfile`, `docker-compose.yaml`.

- [X] **OPS-202**: Local Kubernetes Deployment (Docker Desktop)
  - **Description**: Create Kubernetes manifests (Deployment, Service) and deploy to the local cluster.
  - **Artifacts**: `deploy/k8s/backend.yaml`, `deploy/k8s/frontend.yaml`.

## Phase 3: Cloud Deployment (GKE)

- [X] **OPS-301**: Provision GKE Cluster
  - **Description**: Create cluster on Google Cloud.
  - **Artifacts**: GKE Cluster.

- [X] **OPS-302**: Setup CI/CD with GitHub Actions
  - **Description**: Automate build, push to Artifact Registry, and deploy to GKE.
  - **Artifacts**: `.github/workflows/deploy-gke.yaml`.

## Phase 4: Event-Driven Refactor (Kafka & Dapr)

- [ ] **ARCH-401**: Initialize Dapr & Redpanda
  - **Description**: Deploy Dapr and Redpanda components to the cluster.
  - **Artifacts**: Dapr components YAML.

- [ ] **ARCH-402**: Refactor to Event-Driven Architecture
  - **Description**: Transition direct logic (Recurrence, Audit, Notifications) to use Dapr Pub/Sub and Kafka events.
  - **Artifacts**: New microservices in `services/`.