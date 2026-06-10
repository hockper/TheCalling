# Automated Testing Quickstart

This guide explains how to run the different test suites implemented for The Calling.

## Prerequisites
- Docker & Docker Compose
- Go 1.22+
- Node.js 20+

## 1. Backend Unit Tests
Run fast, isolated tests using mocks.

```bash
cd backend
go test -v -coverprofile=coverage.out ./...
go tool cover -html=coverage.out
```

## 2. Backend Integration Tests
These tests use `testcontainers-go` to spin up a temporary PostgreSQL instance automatically. Ensure Docker daemon is running.

```bash
cd backend
go test -v ./tests/integration/...
```

## 3. Frontend Component Tests
Run React Testing Library unit tests.

```bash
cd frontend
npm run test
npm run test:coverage
```

## 4. End-to-End Tests (Playwright)
Run full browser automation tests against the complete stack.

1. Start the stack: `docker compose up -d`
2. Run tests:
```bash
cd frontend
npm ci
npx playwright install --with-deps
npx playwright test
```

## 5. Performance Tests (k6)
Run load tests against the API. Ensure the stack is running first.

```bash
cd backend/tests/performance
k6 run load.js
```

## 6. Security Scans
Run static analysis and vulnerability scans.

**Backend:**
```bash
cd backend
golangci-lint run
```

**Frontend:**
```bash
cd frontend
npm run lint
```

**Containers:**
```bash
trivy image thecalling-backend:latest
```

## 7. Orchestrated Test Runner
Run the entire testing pipeline (unit, integration, E2E, security, and coverage checks) with one script from the repository root:

```bash
./scripts/run-all-tests.sh
```

## 8. Coverage Check Enforcer
Verify and enforce the minimum 80% code coverage threshold across backend and frontend codebases:

```bash
./scripts/check-coverage.sh
```
