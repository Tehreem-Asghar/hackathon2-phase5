# Feature Specification: Local Kubernetes Deployment

**Feature Branch**: `phase4-local-k8s`
**Created**: 2026-01-16
**Status**: Draft
**Input**: User description: "es file ko read kro or btao phase4 ma kiya karna hai @phase4.pdf" (Requirements from Phase 4 PDF)

## Clarifications

### Session 2026-01-16
- Q: Database Strategy (Local vs External) → A: External Neon DB (Option A).
- Q: Frontend Service Exposure → A: NodePort (Option B).

## User Scenarios & Testing

### User Story 1 - Containerize Application (Priority: P1)

As a developer, I need the frontend and backend applications to be containerized so they can run consistently in any environment.

**Why this priority**: Without containers, we cannot deploy to Kubernetes. This is the foundational step.

**Independent Test**:
- Build Docker images for frontend and backend.
- Run containers using `docker run`.
- Verify the application starts and endpoints are accessible.

**Acceptance Scenarios**:
1. **Given** the backend source code, **When** I build the backend Docker image, **Then** the build succeeds and I can start a container that serves the API.
2. **Given** the frontend source code, **When** I build the frontend Docker image, **Then** the build succeeds and I can start a container that serves the UI.
3. **Given** running containers, **When** I inspect the logs, **Then** I see startup messages indicating success.

---

### User Story 2 - Local Kubernetes Setup (Priority: P1)

As a developer, I want to set up a local Kubernetes cluster using Minikube so I have an environment to deploy the application.

**Why this priority**: We need a target environment to deploy our containers.

**Independent Test**:
- Start Minikube.
- Verify cluster status with `kubectl`.

**Acceptance Scenarios**:
1. **Given** Minikube is installed, **When** I run `minikube start`, **Then** a local Kubernetes cluster starts successfully.
2. **Given** a running cluster, **When** I run `kubectl get nodes`, **Then** I see a ready node.

---

### User Story 3 - Helm Chart Creation (Priority: P2)

As a DevOps engineer, I want to define the application deployment using Helm Charts so I can manage releases and configuration versioning.

**Why this priority**: Helm provides a standard way to package and deploy Kubernetes applications.

**Independent Test**:
- Lint the Helm charts.
- Perform a dry-run install.

**Acceptance Scenarios**:
1. **Given** created Helm charts, **When** I run `helm lint`, **Then** no errors are reported.
2. **Given** created Helm charts, **When** I run `helm template`, **Then** valid Kubernetes manifests are generated.

---

### User Story 4 - Deploy to Minikube (Priority: P2)

As a developer, I want to deploy the full application stack to Minikube using Helm so I can run the app in a production-like environment locally.

**Why this priority**: This is the core objective of Phase 4.

**Independent Test**:
- Run `helm install`.
- Verify pods are running and services are accessible (via port-forwarding or Minikube tunnel).

**Acceptance Scenarios**:
1. **Given** a running Minikube cluster and Helm charts, **When** I install the release, **Then** frontend and backend pods reach `Running` state.
2. **Given** deployed services, **When** I access the frontend URL, **Then** I can see the Todo App.
3. **Given** the deployed app, **When** I interact with the UI, **Then** data is persisted (using the configured database).

---

### User Story 5 - AI-Assisted Operations (Priority: P3)

As a developer, I want to use AI tools (Gordon, kubectl-ai, Kagent) to assist with Docker and Kubernetes operations.

**Why this priority**: Enhances productivity and learning, as specified in the requirements.

**Independent Test**:
- Use `kubectl-ai` to query cluster status.
- Use `kagent` (if available/mocked) for analysis.

**Acceptance Scenarios**:
1. **Given** a running cluster, **When** I ask `kubectl-ai` to "check pods", **Then** it returns the pod status.
2. **Given** Docker Desktop, **When** I use Gordon (if enabled) to generate a Dockerfile, **Then** it suggests a valid Dockerfile.

### Edge Cases

- **Database Persistence**: Ensure data survives pod restarts (requires PersistentVolumes/Claims).
- **Networking**: Frontend container must be able to reach the Backend container within the cluster.
- **Secrets**: Database credentials and API keys must be managed securely (Kubernetes Secrets).
- **Resource Limits**: Pods might crash if memory/CPU limits are too low.

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide a Dockerfile for the backend API (Python/FastAPI).
- **FR-002**: System MUST provide a Dockerfile for the frontend (Next.js).
- **FR-003**: System MUST use Minikube as the local Kubernetes cluster provider.
- **FR-004**: Deployment MUST be managed via Helm Charts (creating a `charts/` directory).
- **FR-005**: System MUST configure the Frontend service as a `NodePort` to allow external access on a high port (e.g., 30000-32767) without requiring a separate tunnel process. Backend MUST use `ClusterIP` for internal communication.
- **FR-006**: System MUST use Kubernetes Secrets for sensitive data (DB credentials, Auth secrets).
- **FR-007**: System MUST configure the Helm Chart to connect to the external Neon PostgreSQL database by default. A local PostgreSQL pod configuration MAY be provided as an optional, disabled-by-default value.

### Key Entities

- **Docker Image**: Container image for the application components.
- **Pod**: Running instance of a container in Kubernetes.
- **Service**: Network abstraction to expose pods.
- **Helm Release**: A deployed instance of the Helm Chart.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Docker build completes successfully for both services.
- **SC-002**: `helm install` command succeeds without errors.
- **SC-003**: All pods (Frontend, Backend) are in `Running` state within 2 minutes of deployment.
- **SC-004**: Application is accessible via `localhost` (or Minikube IP) and functions correctly (Add/List Todos).
