# Implementation Plan: Local Kubernetes Deployment

**Branch**: `phase4-local-k8s` | **Date**: 2026-01-16 | **Spec**: specs/003-local-kubernetes/spec.md
**Input**: Feature specification from `specs/003-local-kubernetes/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

The goal of this phase is to containerize the existing Frontend (Next.js) and Backend (FastAPI) applications and deploy them to a local Kubernetes cluster (Minikube). We will use Docker for containerization, Helm Charts for deployment orchestration, and leverage AI Ops tools (Gordon, kubectl-ai, Kagent) for operational efficiency. The database strategy defaults to connecting to the existing external Neon DB to simplify the initial local deployment.

## Technical Context

**Language/Version**: Python 3.11 (Backend), TypeScript/Node.js 18+ (Frontend)
**Primary Dependencies**: Docker Desktop, Minikube, Helm 3, kubectl, kubectl-ai, kagent
**Storage**: Neon Serverless PostgreSQL (External Connection via Secrets)
**Testing**: `docker run` (Container validation), `helm test` (Chart validation), Manual verification on Minikube
**Target Platform**: Local Kubernetes (Minikube)
**Project Type**: Full-stack Web Application (Containerized)
**Performance Goals**: Pod startup < 30s, Frontend load < 2s on local cluster
**Constraints**: Must run locally on Minikube. Frontend accessible via NodePort (local IP).
**Scale/Scope**: 2 microservices (Frontend, Backend), 1 external DB connection.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Phase IV Matrix Compliance**: ✅ (Minikube, Helm, Docker, AI Ops tools are all permitted Phase IV technologies).
- **Incremental Validity**: ✅ (Phase IV builds upon Phase III application logic without modifying it significantly, just wrapping it).
- **Technology Isolation**: ✅ (Kubernetes manifests/charts are isolated in `charts/` directory).
- **API-First**: ✅ (Existing API remains the contract).

## Project Structure

### Documentation (this feature)

```text
specs/003-local-kubernetes/
├── plan.md              # This file
├── spec.md              # Feature Specification
└── tasks.md             # To be created
```

### Source Code (repository root)

```text
# New Directories/Files
charts/
├── todo-app/            # Main Helm Chart
│   ├── Chart.yaml
│   ├── values.yaml
│   ├── templates/
│   │   ├── _helpers.tpl
│   │   ├── frontend-deployment.yaml
│   │   ├── frontend-service.yaml
│   │   ├── backend-deployment.yaml
│   │   ├── backend-service.yaml
│   │   └── secrets.yaml
│   └── .helmignore

backend/
├── Dockerfile           # Python FastAPI Dockerfile
├── .dockerignore

frontend/
├── Dockerfile           # Next.js Dockerfile
├── .dockerignore

# Existing Structure (Unchanged)
backend/app/...
frontend/src/...
```

**Structure Decision**: We will use a single "umbrella" Helm Chart `todo-app` in a `charts/` directory at the project root. This keeps deployment logic centralized. Dockerfiles will reside in their respective service roots (`backend/` and `frontend/`) to adhere to standard Docker build context practices.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Helm Charts | Kubernetes Deployment Management | Plain `kubectl apply -f` manifests are harder to version, configure, and manage as a single release unit. |
| NodePort Exposure | Local Access | `LoadBalancer` requires `minikube tunnel` which adds process overhead for a simple local test. `Ingress` requires addons. NodePort is the simplest viable local option. |
