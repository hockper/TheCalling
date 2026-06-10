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

---

## 6. Automated Testing (Local & CI)

The project includes a comprehensive automated testing suite. All tests run inside Docker containers, meaning **no local runtimes or test tools are required on your host machine**.

### Running All Tests Locally
To execute the entire test suite exactly as it runs in the GitHub Actions CI pipeline:

```bash
./scripts/run-all-tests.sh
```

This script orchestrates and verifies the following stages sequentially:
1. **Go Backend Tests**: Runs unit and Testcontainers-based Postgres database integration tests.
2. **Next.js Frontend Tests**: Runs unit and component tests using **Vitest** with coverage collection.
3. **Playwright E2E Tests**: Executes browser automation user journeys inside a Playwright container.
4. **Static Analysis & Security Scans**:
   - Runs `eslint` on the frontend codebase.
   - Runs `golangci-lint` on the backend codebase.
   - Runs `gosec` security scanner on Go sources.
5. **Container Scans**: Builds backend and frontend Docker images and runs **Trivy** scanning to check for vulnerabilities.
6. **Coverage Gate**: Validates that both Go backend and Vitest frontend code coverage meet the minimum **80% threshold**.

### Docker Multi-Stage Testing Targets

To ensure the final production container images remain lightweight and secure, all testing libraries and `devDependencies` are stripped from the default container builds.

However, if you want to explicitly run the test suites directly inside the Docker build process, you can build the optional `tester` targets. This builds a specialized stage containing all development dependencies and executes the tests.

**Frontend Tester Target:**
```bash
docker build -t thecalling-frontend:test --target tester ./frontend
```

**Backend Tester Target:**
```bash
docker build -t thecalling-backend:test --target tester ./backend
```

### End-to-End (E2E) Testing

While the `tester` targets isolate and run Unit/Component tests during image builds, **End-to-End (E2E) testing** (via Playwright) requires both the Frontend and Backend to actively communicate over a shared network. 

To execute E2E testing against your actual production-ready Docker images simultaneously:

1. **Spin up the full environment:** Start the entire monorepo stack so that the frontend, backend, and databases are running on the local network.
   ```bash
   docker compose up -d --build
   ```

2. **Execute E2E tests against the live stack:** Direct Playwright to target your local instance using the `mcr.microsoft.com/playwright` image.
   ```bash
   docker run --rm --network host -e PLAYWRIGHT_TEST_BASE_URL=http://localhost -v "$(pwd)/frontend:/app" -w /app mcr.microsoft.com/playwright:v1.60.0-jammy npx playwright test
   ```

*Note: The linter, security, and test runs mount local Docker caching volumes (`go-build-cache`, `go-pkg-mod-cache`, etc.) to optimize and speed up execution after the first run.*
