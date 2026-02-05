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

### 1. Dapr-ization of Existing Services
- Refactor `backend` to use Dapr State Store for conversation history and task state.
- Refactor `backend` to publish events to `kafka-pubsub` component.
- Inject Dapr sidecars into existing Kubernetes deployments.

### 2. Event-Driven Features
- **Audit Log**: Create a simple consumer service that listens to all `task-events` and saves them to a log.
- **Recurring Tasks**: Create a service that listens for `task-completed` where `recurrence != None`.
- **Reminders**: Use Dapr Jobs API to schedule a callback to the `notification` service.

### 3. Local Development (Minikube)
- Install Dapr CLI and initialize on Kubernetes: `dapr init -k`.
- Deploy Redpanda locally using Helm.
- Configure Dapr components (`pubsub.yaml`, `statestore.yaml`, `secrets.yaml`).

### 4. Cloud Deployment (GKE/AKS)
- Provision GKE cluster.
- Setup Redpanda Cloud or Strimzi on GKE.
- Use GitHub Actions to build images, push to Artifact Registry, and apply Helm charts.

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
