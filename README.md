# The Calling

A unified web application monorepo orchestrated via Docker Compose.

## 1. Project Architecture

The project is structured as a monorepo consisting of the following key services:
- **`backend/`**: Go REST API service written following **Clean Architecture** (separating Domain logic, Application use cases, and Adapter interfaces).
- **`frontend/`**: Next.js (App Router) client application configured with strict TypeScript compiler options and stylized with sleek, dark-themed responsive layouts.
- **`gateway/`**: Traefik v3 proxy acting as an API gateway to route traffic based on path prefixes.
- **`postgres`**: Relational PostgreSQL database container.
- **`redis`**: In-memory Redis cache and queue layer.

---

## 2. Local Environment Setup

### Prerequisites
You only need to have the following installed on your host machine:
- **Docker Engine** (v20.10+)
- **Docker Compose** (v2.20+)

*No local language runtimes (Go, Node.js) or database engines are required on the host.*

### Starting the Monorepo Stack
To build and start all containers in detached mode:
```bash
docker compose up -d --build
```

To view logs across all services:
```bash
docker compose logs -f
```

To stop the services:
```bash
docker compose down
```

---

## 3. Service Verification Paths

Once the stack is running, you can access the following entrypoints locally:
- **Next.js Frontend**: `http://localhost/`
- **Go API Health Check**: `http://localhost/health` (Routes through Traefik proxy and pings Postgres & Redis)
- **Traefik Admin Dashboard**: `http://localhost:8080/dashboard/`

---

## 4. API Client & Code Generation

All frontend-backend communications are governed strictly by the central [openapi.yaml](openapi.yaml) contract at the repository root.

To automatically generate type-safe typescript client helpers and model schemas:
1. Enter the frontend folder: `cd frontend`
2. Run the client generator script:
   ```bash
   npm run generate-client
   ```
   This executes **Orval** to compile typescript queries and interfaces directly in `frontend/src/services/api/`.

---

## 5. Development Pipelines & Quality Gates

On every push and pull request, the GitHub Actions CI pipeline enforces the following checks:
- **Backend Quality**: Runs `golangci-lint` (formatting/linting), `gosec` (SAST analysis), and standard Go tests.
- **Frontend Quality**: Runs Next.js `npm run lint`.
- **Security Gates**: Builds the container images and executes **Trivy** scanning to detect critical or high vulnerability package dependencies.
