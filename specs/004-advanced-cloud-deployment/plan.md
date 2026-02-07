# Implementation Plan: Phase V - Advanced Cloud Deployment

**Branch**: `004-phase-v` | **Date**: 2026-02-05 | **Spec**: [specs/004-advanced-cloud-deployment/spec.md](specs/004-advanced-cloud-deployment/spec.md)

## Summary

This plan outlines the technical evolution of the entire **Full-Stack Todo Application** (including the AI Chatbot) into a production-grade, event-driven microservices system. We will integrate Dapr as a distributed runtime to abstract infrastructure (Kafka, Postgres, Secrets) and implement advanced features like recurring tasks, scheduled reminders, and real-time synchronization. The final goal is a fully automated deployment of the complete system to a cloud Kubernetes cluster (GKE/AKS) using GitHub Actions.

## Technical Context

**Language/Version**: 
- Backend: Python 3.11+
- Frontend: Node.js 18+ (Next.js 15)
**Primary Dependencies**: 
- **Dapr SDK**: `dapr-sdk-python`, `dapr-sdk-js`
- **Messaging**: Redpanda (Kafka-compatible)
- **Scheduling**: Dapr Jobs API (alpha) or Cron Bindings
- **Real-time**: WebSockets (using Dapr Pub/Sub as backplane)
- **Database**: Neon Serverless PostgreSQL (via Dapr State Store)
**Storage**: Neon (State), Kafka/Redpanda (Events)
**Testing**: 
- **Integration**: Testing Dapr sidecar interactions using `dapr run`
- **Unit**: Mocking Dapr clients
**Target Platform**: Google Cloud (GKE) or Azure (AKS)
**Project Type**: Distributed Microservices
**Performance Goals**: Event latency < 100ms, Sync latency < 500ms
**Constraints**: No direct Kafka/Postgres connection strings in app code (must use Dapr abstractions).

## Constitution Check

- **Phase-Governed Development**: ✅ Phase V goal aligns with the Constitution.
- **Technology Isolation**: ✅ Kafka/Redpanda and Dapr are the designated technologies for this phase.
- **Incremental Validity**: ✅ The system will be functional on Minikube before moving to Cloud.
- **API-First Design**: ✅ New event schemas will be defined before implementation.
- **Test Discipline**: ✅ Event-driven testing strategies included.
- **Minimal Complexity**: ✅ Dapr simplifies microservice complexity by handling retries, mTLS, and state.
- **Observability**: ✅ Dapr provides built-in distributed tracing and metrics.

## Project Structure

### Documentation

```text
specs/004-advanced-cloud-deployment/
├── plan.md              # This file
├── spec.md              # Requirements
├── architecture.md      # Dapr & Event Flow diagrams
└── tasks.md             # Actionable tasks
```

### New Services (Microservices)

```text
services/
├── notification/        # Reminder delivery logic
├── recurring/           # Next-occurrence generation
└── audit/               # Activity log persistence
```

## Implementation Strategy

### Stage 1: Direct Feature Implementation (Safety First)
*Goal: Ensure a fully functional app before architectural complexity.*
- **Intermediate Features**: Implement `priority`, `tags`, `search`, `filter`, and `sort` directly in the existing Backend and Frontend.
- **Advanced Features**: Implement `due_date`, `reminders` (using simple background tasks/polling for now), and `recurring_tasks` (logic triggered on completion).
- **Validation**: Verify all features work in the standard dev environment.

### Stage 2: Containerization & Local Kubernetes
- **Dockerization**: Create Dockerfiles for Frontend and Backend. Use Docker Compose for local testing.
- **Local K8s**: Deploy to Docker Desktop Kubernetes. Create Deployment and Service manifests.
- **Secrets**: Use standard Kubernetes Secrets for database strings.

### Stage 3: Cloud Deployment (GKE)
- **Provisioning**: Setup GKE cluster.
- **CI/CD**: Configure GitHub Actions to deploy the "Stage 2" version to GKE.

### Stage 4: Event-Driven Refactor (Kafka & Dapr)
- **Dapr Integration**: Abstract state store and secrets.
- **Kafka Integration**: Introduce Redpanda. Refactor Audit Log, Recurring Tasks, and Notifications to use Dapr Pub/Sub and Jobs API.
- **Final Validation**: Transition from direct logic to the event-driven architecture.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Multiple Services | Decoupling logic for reminders/recurrence | Monolith becomes too brittle and hard to scale for event processing. |
| Kafka/Redpanda | Event-driven architecture requirement | Simple database polling is inefficient and doesn't scale. |
| Dapr Sidecars | Abstracting infrastructure and mTLS | Manual implementation of service discovery and retries is error-prone. |

## Success Criteria Checklist

- [ ] Dapr sidecars running for all pods.
- [ ] Kafka events successfully flowing between services.
- [ ] Task completion triggers creation of next recurring instance.
- [ ] Reminder notification received at scheduled time.
- [ ] CI/CD pipeline green and app accessible via Cloud URL.
