# Quickstart: Local Kubernetes Deployment

This guide will help you deploy the Todo App to your local Docker Desktop Kubernetes cluster using Helm.

## Prerequisites

1.  **Docker Desktop** with **Kubernetes Enabled**.
    - Verify: `kubectl get nodes` should show `docker-desktop` as Ready.
2.  **Helm** installed.
    - Windows (Chocolatey): `choco install kubernetes-helm`
    - Windows (Scoop): `scoop install helm`
    - Verify: `helm version`

## 1. Build Docker Images

Since we are using a local cluster, we need to build the images so they are available to Docker Desktop.

```powershell
# Build Backend
docker build -t todo-backend:local ./backend

# Build Frontend
docker build -t todo-frontend:local ./frontend
```

## 2. Configure Secrets

Create a file named `my-secrets.yaml` in the root directory to hold your actual secrets. **Do not commit this file.**

```yaml
# my-secrets.yaml
secrets:
  databaseUrl: "postgresql://neondb_owner:password@ep-something.aws.neon.tech/neondb?sslmode=require" # Replace with your REAL Neon DB URL
  betterAuthSecret: "your-super-secret-value" # Replace with your REAL Better Auth secret
  betterAuthUrl: "http://localhost:30000"
```

## 3. Deploy with Helm

Deploy the application using the chart we created.

```powershell
# Install the chart
helm install todo-app ./charts/todo-app -f my-secrets.yaml
```

## 4. Verify Deployment

Check if the pods are running:

```powershell
kubectl get pods
```

Wait until you see `todo-app-backend-...` and `todo-app-frontend-...` with status `Running`.

## 5. Access the App

Open your browser and navigate to:

[http://localhost:30000](http://localhost:30000)

## Troubleshooting

- **Pods Pending?** Check `kubectl describe pod <pod-name>`. It might be waiting for resources.
- **Pods Crashing?** Check logs: `kubectl logs <pod-name>`.
- **Database Connection Error?** Ensure your `databaseUrl` in `my-secrets.yaml` is correct and accessible from your internet connection.

## Cleanup

To remove the application:

```powershell
helm uninstall todo-app
```
