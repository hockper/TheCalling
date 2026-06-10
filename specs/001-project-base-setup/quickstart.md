# Quickstart Guide: Project Base Setup

**Feature**: [spec.md](file:///home/hockper/Documents/TheCalling/specs/001-project-base-setup/spec.md)

This guide provides instructions to spin up, verify, and work with the newly initialized "The Calling" base monorepo stack.

## 1. Prerequisites

You must have the following installed on your local host:
- **Docker Engine** (v20.10+)
- **Docker Compose** (v2.20+)

*No local language runtimes (Go, Node.js) or databases (PostgreSQL) are required.*

---

## 2. Local Stack Execution

To start the entire monorepo environment (Frontend, Backend, Postgres, Redis, Traefik proxy) in detached mode, run:

```bash
docker compose up -d
```

To view real-time log aggregates across all services:

```bash
docker compose logs -f
```

To stop the entire stack:

```bash
docker compose down
```

---

## 3. Verification Checklist

Verify that the proxy gateway and services are responding correctly:

1. **API Gateway (Traefik) Dashboard**:
   - Access: `http://localhost:8080/dashboard/` (If dashboard entrypoint is enabled)
2. **Backend API Health Check**:
   - URL: `http://localhost/health` (Routed through Traefik)
   - Expected JSON Response:
     ```json
     {
       "status": "ok",
       "database": "connected",
       "redis": "connected"
     }
     ```
3. **Frontend Application**:
   - URL: `http://localhost/` (Routed through Traefik)
   - Expected Output: Next.js initial default page.

---

## 4. API Client & Code Generation

To generate the frontend TypeScript client, query hooks, and domain types from the central `openapi.yaml` contract:

1. Enter the frontend workspace directory (locally or inside a shell container).
2. Run the generator script:
   ```bash
   npm run generate-client
   ```
3. This generates fetch wrappers and TypeScript types in the `frontend/src/services/api` directory.

---

## 5. Running Quality Pipelines Locally

You can execute lints and tests inside the local docker containers without installing SDKs:

```bash
# Run backend tests
docker compose exec backend go test ./...

# Run backend lints
docker compose exec backend golangci-lint run

# Run frontend tests
docker compose exec frontend npm test

# Run frontend lints
docker compose exec frontend npm run lint
```
