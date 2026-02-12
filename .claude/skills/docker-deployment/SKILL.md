# Docker & Deployment Skill

## Description
A comprehensive skill for containerizing applications and deploying them using Docker and docker-compose. This skill provides guidance and templates for creating efficient, scalable, and production-ready containerized deployments.

## Features
- Multi-stage Docker builds for optimized images
- Docker Compose orchestration for multi-service applications
- Environment configuration management
- Health checks and readiness probes
- Volume management and persistence
- Network configuration
- Production deployment strategies
- Resource optimization

## Docker Implementation

### 1. Generic Backend Dockerfile
```dockerfile
# Dockerfile for backend services
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash app \
    && chown -R app:app /app
USER app

EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"]
```

### 2. Generic Frontend Dockerfile
```dockerfile
# Dockerfile for frontend services
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built application and production dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001
USER nextjs

EXPOSE 3000

CMD ["npm", "start"]
```

### 3. Multi-service Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: app-db
    restart: always
    environment:
      POSTGRES_USER: ${DB_USER:-user}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-password}
      POSTGRES_DB: ${DB_NAME:-dbname}
    ports:
      - "${DB_PORT:-5432}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-user} -d ${DB_NAME:-dbname}"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: app-redis
    restart: always
    ports:
      - "${REDIS_PORT:-6379}:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 3

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: app-backend
    restart: always
    environment:
      - DATABASE_URL=postgresql+asyncpg://${DB_USER:-user}:${DB_PASSWORD:-password}@db:5432/${DB_NAME:-dbname}
      - REDIS_URL=redis://redis:6379
      - SECRET_KEY=${SECRET_KEY}
      - BACKEND_CORS_ORIGINS=${BACKEND_CORS_ORIGINS:-[]}
    ports:
      - "${BACKEND_PORT:-8000}:8000"
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-http://localhost:8000}
    container_name: app-frontend
    restart: always
    environment:
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-http://localhost:8000}
    ports:
      - "${FRONTEND_PORT:-3000}:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
  redis_data:
```

### 4. Production Docker Compose
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    container_name: app-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend

  db:
    image: postgres:15-alpine
    container_name: app-db-prod
    restart: always
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data_prod:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    container_name: app-backend-prod
    restart: always
    environment:
      - DATABASE_URL=postgresql+asyncpg://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
      - REDIS_URL=redis://redis:6379
      - SECRET_KEY=${SECRET_KEY}
      - BACKEND_CORS_ORIGINS=${BACKEND_CORS_ORIGINS}
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    container_name: app-frontend-prod
    restart: always
    environment:
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
    depends_on:
      - backend

volumes:
  postgres_data_prod:
```

### 5. Environment Configuration
```bash
# .env.example
# Database Configuration
DB_USER=user
DB_PASSWORD=password
DB_NAME=dbname
DB_PORT=5432

# Application Configuration
SECRET_KEY=your-super-secret-key-here
BACKEND_PORT=8000
FRONTEND_PORT=3000

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
BACKEND_CORS_ORIGINS=["http://localhost:3000", "http://localhost:8080"]

# Redis Configuration
REDIS_PORT=6379
```

## Best Practices

1. **Multi-stage Builds**: Use multi-stage builds to minimize attack surface and image size
2. **Non-root Users**: Run containers as non-root users for security
3. **Health Checks**: Implement health checks for reliable service orchestration
4. **Environment Variables**: Use environment variables for configuration
5. **Volume Management**: Use named volumes for persistent data
6. **Network Isolation**: Use custom networks for service isolation
7. **Resource Limits**: Set resource limits to prevent resource exhaustion
8. **Security Scanning**: Scan images for vulnerabilities regularly

## Common Patterns

1. **Dependency Caching**: Copy dependencies first to leverage Docker layer caching
2. **Wait Strategies**: Use depends_on with health checks for proper startup ordering
3. **Configuration Management**: Use .env files for environment-specific configuration
4. **Reverse Proxy**: Use nginx as a reverse proxy for production deployments
5. **Load Balancing**: Configure load balancing for high availability

## Production Deployment

1. **CI/CD Pipeline**: Implement automated builds and deployments
2. **Monitoring**: Set up monitoring and alerting for containers
3. **Backup Strategy**: Implement backup and recovery procedures
4. **Rolling Updates**: Use rolling updates to minimize downtime
5. **Security Hardening**: Apply security best practices for production

## Troubleshooting

1. **Container Logs**: Use docker logs to troubleshoot issues
2. **Network Connectivity**: Check network connectivity between services
3. **Resource Limits**: Monitor resource usage and adjust limits as needed
4. **Health Checks**: Verify health check endpoints are working properly
5. **Environment Variables**: Ensure all required environment variables are set