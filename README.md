# 🚀 TaskMaster: AI-Powered Microservices Todo System

**TaskMaster** is a production-ready, full-stack task management ecosystem developed for **Hackathon Phase V**. It transforms a standard Todo app into a sophisticated, cloud-native platform featuring a Gemini-powered AI Assistant, automated recurring logic, and high-performance filtering.

[![Deployment Status](https://github.com/your-username/your-repo/actions/workflows/deploy-gke.yaml/badge.svg)](https://github.com/your-username/your-repo/actions)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2015-000000?style=flat&logo=next.js)](https://nextjs.org/)
[![Kubernetes](https://img.shields.io/badge/Orchestration-Kubernetes-326CE5?style=flat&logo=kubernetes)](https://kubernetes.io/)
[![Google Cloud](https://img.shields.io/badge/Cloud-GKE-4285F4?style=flat&logo=google-cloud)](https://cloud.google.com/kubernetes-engine)

---

## 🌐 Live Access
*   **Frontend UI**: [http://34.16.87.197](http://34.16.87.197)
*   **API Documentation**: [http://34.31.155.250/docs](http://34.31.155.250/docs)

---

## ✨ Key Features

### 🧠 AI Todo Assistant (Gemini Pro)
*   **Natural Language Interaction**: Chat with your task list to create, summarize, or delete tasks.
*   **Context Awareness**: The bot understands your existing tasks and helps you prioritize them.

### 🔄 Advanced Automation
*   **Recurring Tasks**: Support for `Daily`, `Weekly`, and `Monthly` cycles. The system automatically spawns the next occurrence the moment you complete the current one.
*   **Smart Due Dates**: Visual indicators for upcoming and overdue tasks.
*   **Orphan Protection**: Intelligent deletion logic that maintains data integrity between parent and child recurring tasks.

### 🔍 Pro-Level Organization
*   **Global Search**: High-speed indexing across titles, descriptions, and tags.
*   **Dynamic Filtering**: Filter by **Priority** (High/Medium/Low) and **Tags** using PostgreSQL JSONB optimized queries.
*   **Case-Insensitive Tagging**: Seamlessly find `#Work` or `#work` using partial match logic.

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 15, TypeScript, Tailwind CSS, Lucide Icons |
| **Backend** | Python 3.11, FastAPI, SQLModel (Async SQLAlchemy) |
| **Database** | Neon Serverless PostgreSQL (JSONB Optimized) |
| **Containerization** | Docker, Docker Compose |
| **Orchestration** | Kubernetes (GKE Autopilot & Docker Desktop) |
| **CI/CD** | GitHub Actions, Google Artifact Registry |
| **AI** | Google Gemini API |

---

## 📂 Project Structure

```text
├── .github/workflows/      # Automated GKE Deployment Pipeline
├── backend/                # FastAPI Application
│   ├── app/                # Core logic (models, schemas, routes)
│   ├── Dockerfile          # Production Python build
│   └── requirements.txt    # Python dependencies
├── frontend/               # Next.js Application
│   ├── src/                # UI Components & App Router
│   ├── Dockerfile          # Multi-stage Node.js build
│   └── package.json        # JS dependencies
├── deploy/                 # Orchestration Manifests
│   └── k8s/                # Kubernetes Deployment, Service, & Secrets
├── docker-compose.yml      # Local Container Orchestration
└── README.md               # Documentation
```

---

## 🚀 Installation & Setup

### 1. Local Development (No Docker)
**Backend:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Or .venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### 2. Using Docker Compose (Recommended)
Launch the entire stack (Frontend, Backend, DB) with one command:
```bash
docker-compose up --build
```

### 3. Using Kubernetes (Local)
Deploy to your Docker Desktop K8s cluster:
```bash
kubectl apply -f deploy/k8s/secrets.yaml
kubectl apply -f deploy/k8s/postgres.yaml
kubectl apply -f deploy/k8s/backend.yaml
kubectl apply -f deploy/k8s/frontend.yaml
```

---

## ☁️ Cloud Architecture & CI/CD
This project follows a modern DevOps workflow:
1.  **Code Push**: Developer pushes to `main` branch.
2.  **Continuous Integration**: GitHub Actions builds Docker images for Frontend and Backend.
3.  **Artifact Storage**: Images are tagged with Commit SHA and pushed to **Google Artifact Registry**.
4.  **Continuous Deployment**: GitHub Actions connects to **GKE Autopilot**, updates the manifests using `envsubst` for secret injection, and triggers a rolling update.
5.  **Service Exposure**: **GCP LoadBalancers** assign external IPs to the cluster, making the app accessible globally.

---

## 🔒 Security
*   **Secret Masking**: No API keys or database strings are stored in plain text in the repository.
*   **Environment Injection**: All sensitive data is injected at runtime via GitHub Secrets and Kubernetes Opaque Secrets.
*   **CORS Protection**: Restricted origins ensure only the verified frontend can communicate with the API.

---

## 📜 License
Developed for the **Hackathon Phase 5**. All rights reserved.
