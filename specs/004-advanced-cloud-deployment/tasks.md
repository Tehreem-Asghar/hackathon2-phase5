# Implementation Tasks: Phase V - Advanced Cloud Deployment

**Branch**: `004-phase-v` | **Spec**: [specs/004-advanced-cloud-deployment/spec.md](specs/004-advanced-cloud-deployment/spec.md) | **Plan**: [specs/004-advanced-cloud-deployment/plan.md](specs/004-advanced-cloud-deployment/plan.md)

## Infrastructure Tasks (Local & Cloud)

- [ ] **INF-001**: Install and Initialize Dapr on Minikube
  - **Description**: Install Dapr CLI and initialize Dapr in the local Kubernetes cluster.
  - **Preconditions**: Minikube running.
  - **Outcome**: `dapr status -k` shows all control plane services running.
  - **Artifacts**: Minikube cluster state.

- [ ] **INF-002**: Deploy Redpanda (Kafka) on Minikube
  - **Description**: Deploy Redpanda using Helm charts to act as the message broker.
  - **Preconditions**: INF-001.
  - **Outcome**: Redpanda cluster running in `kafka` namespace.
  - **Artifacts**: Helm release `redpanda`.

- [ ] **INF-003**: Configure Dapr Components (Local)
  - **Description**: Create YAML files for Dapr components: `pubsub.kafka`, `statestore.postgresql`, and `secretstores.kubernetes`.
  - **Preconditions**: INF-002.
  - **Outcome**: Dapr can communicate with Kafka and Postgres.
  - **Artifacts**: `deploy/dapr/pubsub.yaml`, `deploy/dapr/statestore.yaml`.

- [ ] **INF-004**: Provision GKE Cluster
  - **Description**: Create a Kubernetes cluster on Google Cloud Platform.
  - **Preconditions**: GCP account with credits.
  - **Outcome**: Functional GKE cluster accessible via `kubectl`.
  - **Artifacts**: GCP Console/CLI output.

## Service Refactoring Tasks (Dapr-ization)

- [ ] **SRV-001**: Refactor Backend to use Dapr State Store
  - **Description**: Replace direct Neon/SQLModel session calls with Dapr State Store HTTP/gRPC calls for task state.
  - **Preconditions**: INF-003.
  - **Outcome**: Backend state is managed via Dapr abstraction.
  - **Artifacts**: `backend/app/db/dapr_state.py`.

- [ ] **SRV-002**: Implement Event Publication in Backend
  - **Description**: Emit `task-events` (created, updated, completed, deleted) to Dapr Pub/Sub.
  - **Preconditions**: SRV-001.
  - **Outcome**: Actions in the UI trigger Kafka messages.
  - **Artifacts**: `backend/app/api/routes/todos.py` (updated).

- [ ] **SRV-003**: Inject Dapr Sidecars into Deployments
  - **Description**: Update Kubernetes deployment manifests to include Dapr annotations (`dapr.io/enabled: "true"`).
  - **Preconditions**: INF-001.
  - **Outcome**: Each pod has a `daprd` sidecar.
  - **Artifacts**: `charts/todo-app/templates/deployment.yaml`.

## Advanced Features Tasks (New Services)

- [ ] **FEAT-001**: Implement Recurring Task Service
  - **Description**: Create a new Python service that subscribes to `task-events`, filters for `completed` recurring tasks, and creates the next occurrence.
  - **Preconditions**: SRV-002.
  - **Outcome**: Completing a "Daily" task creates a new one for tomorrow.
  - **Artifacts**: `services/recurring/main.py`, `services/recurring/Dockerfile`.

- [ ] **FEAT-002**: Implement Notification Service & Reminders
  - **Description**: Integrate Dapr Jobs API to schedule reminders. Implement a service to handle callbacks and "notify" users.
  - **Preconditions**: SRV-002.
  - **Outcome**: Users receive reminders at the specified time.
  - **Artifacts**: `services/notification/main.py`.

- [ ] **FEAT-003**: Implement Audit Log Service
  - **Description**: Create a consumer service that stores every task event into an `audit_logs` table for history tracking.
  - **Preconditions**: SRV-002.
  - **Outcome**: Persistent history of all task changes.
  - **Artifacts**: `services/audit/main.py`.

- [ ] **FEAT-004**: Real-time Sync via WebSockets
  - **Description**: Use Dapr Pub/Sub to broadcast task updates to a WebSocket server that notifies the frontend.
  - **Preconditions**: SRV-002.
  - **Outcome**: Multi-client UI updates without refresh.
  - **Artifacts**: `services/sync/main.py` (or integrated into backend).

## CI/CD & Cloud Tasks

- [ ] **CI-001**: Dockerize New Services
  - **Description**: Create Dockerfiles for all new microservices (Audit, Recurring, Notification).
  - **Preconditions**: FEAT-001, FEAT-002, FEAT-003.
  - **Outcome**: Images can be built and pushed to registry.
  - **Artifacts**: `services/*/Dockerfile`.

- [ ] **CI-002**: Setup GitHub Actions for Cloud Deployment
  - **Description**: Create a workflow that builds images, pushes to GCP Artifact Registry, and deploys to GKE using Helm.
  - **Preconditions**: INF-004, CI-001.
  - **Outcome**: Automatic deployment on `git push`.
  - **Artifacts**: `.github/workflows/deploy-gke.yaml`.

- [ ] **MON-001**: Configure Monitoring & Logging
  - **Description**: Set up Dapr observability with Prometheus and Grafana on the cluster. Enable GKE Cloud Logging.
  - **Preconditions**: INF-004.
  - **Outcome**: Visual dashboards for system health and logs.
  - **Artifacts**: `deploy/monitoring/grafana-dashboard.json`.
