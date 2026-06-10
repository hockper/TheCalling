# Research Report: Project Base Setup Architecture

**Feature**: [spec.md](file:///home/hockper/Documents/TheCalling/specs/001-project-base-setup/spec.md)

This research document analyzes the key infrastructure decisions for bootstrapping "The Calling" monorepo.

## 1. Container Orchestration & API Gateway

### Decision
Use a root-level `docker-compose.yml` orchestrating all services, using **Traefik v3** as the reverse proxy and API gateway.

### Rationale
- **Single-command local execution**: Running `docker compose up` starts the Next.js frontend, Go backend, PostgreSQL, Redis, and Traefik proxy.
- **Dynamic Service Discovery**: Traefik reads Docker container labels to configure routes, eliminating the need to maintain static configuration files for reverse proxy rules.
- **Header Routing**: Traefik easily routes path prefixes (e.g., `/api/*` goes to backend, everything else to frontend).

### Alternatives Considered
- **NGINX**: Requires writing and maintaining a custom NGINX configuration file (`nginx.conf`) and manually updating ports/upstreams. Less dynamic in a dockerized local setup.
- **Caddy**: Simple to configure, but Traefik has more mature dashboard tools and native support for Docker labels out of the box.

---

## 2. Go Backend Architecture Layout

### Decision
Implement **Clean Architecture** structure with strict physical boundaries using Go packages:
- `internal/domain`: Pure entity definitions and domain rules. Must have 0 external dependencies.
- `internal/application`: Use cases, commands, queries, and interface ports (e.g., repository interfaces).
- `internal/adapter`: Repository implementations (SQL/PostgreSQL), HTTP controllers/handlers, Redis publishers, and configuration loaders.

### Rationale
- **Decoupled Business Logic**: Ensures the core business logic remains independent of the database, web server framework (e.g., Chi/Gin), and third-party libraries.
- **Testability**: Allows domain logic and application use cases to be 100% unit-tested by mocking the interface ports defined in the application layer.

### Alternatives Considered
- **Traditional Layered Architecture (Controller-Service-DAO)**: Simplistic but often leaks database-specific details (e.g., ORM models or SQL tags) into the service layer, making it hard to decouple.
- **Standard Flat Go Package**: Suitable for small microservices, but quickly becomes unmanageable as the business domain grows in a modular monolith.

---

## 3. OpenAPI Contract & Automated Code Generation

### Decision
Bootstrap API design with an **OpenAPI 3.0.0 (YAML)** schema, using **Orval** to automatically generate frontend TypeScript fetch clients and query hooks.

### Rationale
- **Contract-First Design**: Guarantees alignment between the backend handlers and the frontend client implementations.
- **Type Safety**: Avoids runtime errors by generating strict TypeScript interfaces for all request and response structures directly from the schema.
- **Developer Velocity**: Saves hours of writing manual API integration code on the frontend.

### Alternatives Considered
- **Manual API Client**: Writing fetch requests and typescript interfaces manually is highly error-prone and leads to type drift.
- **OpenAPI Generator CLI (Java)**: Generates highly verbose and boilerplate-heavy client SDKs that do not integrate as naturally with React/Next.js compared to Orval.

---

## 4. DevSecOps Scanning (SAST & Vulnerability Gates)

### Decision
Configure GitHub Actions with **golangci-lint** (linting), **gosec** (SAST security checks), and **Trivy** (container filesystem and package dependency vulnerability scanning).

### Rationale
- **Shift-Left Security**: Detects code flaws and insecure dependencies (e.g., outdated base container images) before merging to `main`.
- **Trivy Integration**: Trivy is fast, low-friction, and outputs reports that can be integrated into the CI flow or blocked based on severity thresholds.

### Alternatives Considered
- **SonarQube (Self-hosted or Cloud)**: Powerful but requires additional authentication tokens, setup, and can be slow for simple base monorepo pipelines.
- **GitHub CodeQL**: Excellent SAST tool, but lacks direct container image scanning (which Trivy excels at). A combination of lightweight linters is more efficient for local execution testing.
