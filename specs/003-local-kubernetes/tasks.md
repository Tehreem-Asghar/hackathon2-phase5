# Tasks: Local Kubernetes Deployment

**Input**: Design documents from `specs/003-local-kubernetes/`
**Prerequisites**: plan.md, spec.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Containerization (User Story 1 & 5)

**Goal**: Create Dockerfiles for the frontend and backend services.
**Independent Test**: `docker build` and `docker run` successfully for each service.

- [ ] T001 [P] [US1] Create `backend/Dockerfile` to containerize the FastAPI application. Use `python:3.11-slim` as the base image.
- [ ] T002 [P] [US1] Create `backend/.dockerignore` to exclude `.venv`, `__pycache__`, and `.pytest_cache` from the build context.
- [ ] T003 [P] [US1] Create `frontend/Dockerfile` for the Next.js application. Use a multi-stage build with `node:18-alpine` for smallest image size.
- [ ] T004 [P] [US1] Create `frontend/.dockerignore` to exclude `node_modules` and `.next` from the build context.
- [ ] T005 [P] [US5] (Optional) If Docker AI (Gordon) is available, use `docker ai "scaffold backend"` to get a starting `Dockerfile` for the backend.
- [ ] T006 [US1] Build the backend image locally: `docker build -t todo-backend:local ./backend`
- [ ] T007 [US1] Build the frontend image locally: `docker build -t todo-frontend:local ./frontend`

---

## Phase 2: Local Kubernetes Setup (User Story 2 & 5)

**Goal**: Start and verify a local Kubernetes cluster using Minikube.
**Independent Test**: `kubectl get nodes` shows a ready cluster.

- [ ] T008 [US2] Start Minikube cluster: `minikube start --driver=docker`
- [ ] T009 [US2] Verify cluster status: `kubectl get nodes`
- [ ] T010 [US2] Load local Docker images into Minikube's registry: `minikube image load todo-backend:local` and `minikube image load todo-frontend:local`
- [ ] T011 [P] [US5] (Optional) Install `kubectl-ai` plugin if not already present.
- [ ] T012 [P] [US5] (Optional) Install `kagent` if not already present.
- [ ] T013 [P] [US5] (Optional) Use `kubectl-ai "check cluster health"` to test AI ops tool.

---

## Phase 3: Helm Chart Creation (User Story 3)

**Goal**: Create a Helm chart to manage the deployment of the application.
**Independent Test**: `helm lint` and `helm template` run successfully.

- [ ] T014 [US3] Create a new Helm chart directory: `helm create charts/todo-app`
- [ ] T015 [US3] Clean up default templates: `rm -rf charts/todo-app/templates/*`
- [ ] T016 [P] [US3] Create `charts/todo-app/templates/backend-deployment.yaml` for the backend Deployment. Set `imagePullPolicy: Never` to use local images.
- [ ] T017 [P] [US3] Create `charts/todo-app/templates/backend-service.yaml` to expose the backend internally via a `ClusterIP` service.
- [ ] T018 [P] [US3] Create `charts/todo-app/templates/frontend-deployment.yaml` for the frontend Deployment. Set `imagePullPolicy: Never`.
- [ ] T019 [P] [US3] Create `charts/todo-app/templates/frontend-service.yaml` to expose the frontend externally via a `NodePort` service.
- [ ] T020 [P] [US3] Create `charts/todo-app/templates/secrets.yaml` to manage the Neon DB connection string and Better Auth secret.
- [ ] T021 [US3] Update `charts/todo-app/values.yaml` to define default values for images, replicas, service ports, and to hold placeholders for secrets.
- [ ] T022 [US3] Lint the Helm chart to check for errors: `helm lint charts/todo-app`
- [ ] T023 [US3] Run a dry-run install to verify generated manifests: `helm install todo-app charts/todo-app --dry-run`

---

## Phase 4: Minikube Deployment & Verification (User Story 4)

**Goal**: Deploy the application to Minikube using the Helm chart and verify it works.
**Independent Test**: Application is accessible via the NodePort URL and is fully functional.

- [ ] T024 [US4] Deploy the application using Helm: `helm install todo-app charts/todo-app -f my-secrets.yaml` (where `my-secrets.yaml` contains user-specific secrets).
- [ ] T025 [US4] Check the status of the deployment: `kubectl get deployments`
- [ ] T026 [US4] Check the status of the pods: `kubectl get pods -w`
- [ ] T027 [US4] Get the URL for the frontend service: `minikube service todo-app-frontend --url`
- [ ] T028 [US4] Access the URL in a browser and verify the Todo application is working (add, list, complete tasks).
- [ ] T029 [US4] Troubleshoot any issues using `kubectl logs <pod-name>` and `kubectl describe pod <pod-name>`.
- [ ] T030 [US5] (Optional) If pods are failing, use `kubectl-ai "why is my pod <pod-name> failing?"` to debug.

---

## Phase 5: Documentation & Cleanup

**Goal**: Document the process and clean up resources.

- [ ] T031 [P] Create a `specs/003-local-kubernetes/quickstart.md` with step-by-step instructions on how to deploy the application.
- [ ] T032 Uninstall the Helm release: `helm uninstall todo-app`
- [ ] T033 Stop the Minikube cluster: `minikube stop`
