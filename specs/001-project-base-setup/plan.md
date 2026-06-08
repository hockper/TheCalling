# Implementation Plan: Project Base Setup

**Branch**: `001-project-base-setup` | **Date**: 2026-06-06 | **Spec**: [spec.md](file:///home/hockper/Documents/TheCalling/specs/001-project-base-setup/spec.md)

**Input**: Feature specification from `/specs/001-project-base-setup/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command.

## Summary
The goal is to initialize a unified monorepo base setup for "The Calling". The project will feature a Go backend following Clean Architecture principles, a Next.js TypeScript frontend, PostgreSQL, Redis, and a Traefik API gateway. The entire stack will be orchestrated using a root-level `docker-compose.yml` to allow single-command local execution without local SDK installations. Automated client generation will be bootstrapped via a central OpenAPI contract, and a GitHub Actions pipeline will enforce linting, unit testing, SAST, and Trivy container scanning.

## Technical Context

**Language/Version**: Go (Golang) 1.21+, Node.js 20+ (Next.js 14+), TypeScript 5+

**Primary Dependencies**: Next.js, React, Traefik, PostgreSQL, Redis, golangci-lint, ESLint, Trivy, GitHub Actions

**Storage**: PostgreSQL 15+, Redis 7+

**Testing**: Go standard testing package (`testing`), Jest/Vitest for frontend

**Target Platform**: Docker/Docker Compose environment (Linux / macOS / Windows with WSL2)

**Project Type**: Web Application Monorepo

**Performance Goals**: Local service startup under 2 minutes, local API response time under 100ms

**Constraints**: Monorepo stack must run entirely via Docker Compose without local host SDK dependencies

**Scale/Scope**: Core architecture layout for backend and frontend, API contracts, local proxy routing, CI validations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

* **I. Modular Monolith & Clean Architecture**: PASS. The backend will strictly isolate domain, application, and adapter layers.
* **II. API Design-First & Automation**: PASS. OpenAPI schema will govern frontend-backend contract, enabling automated client generation.
* **III. Type Safety & Componentization**: PASS. Next.js App Router with strict TypeScript compiler checks and component styling.
* **IV. DevSecOps & Shift-Left Security**: PASS. GitHub Actions workflow configured with SAST (golangci-lint/CodeQL) and Trivy image scanning.
* **V. Local Execution & Infrastructure as Code**: PASS. Unified orchestration via root-level `docker-compose.yml` exposing Traefik gateway.

## Project Structure

### Documentation (this feature)

```text
specs/001-project-base-setup/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── openapi.yaml     # OpenAPI 3.0 Contract Specification
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
backend/
├── cmd/
│   └── server/
│       └── main.go       # Go API main entrypoint
├── internal/
│   ├── domain/           # Core business entities and logic (no external dependencies)
│   ├── application/      # Use cases and port interfaces
│   └── adapter/          # DB repositories, HTTP handlers, outer frameworks
├── go.mod
└── go.sum

frontend/
├── src/
│   ├── app/              # Next.js App Router (pages and layouts)
│   ├── components/       # Reusable UI component elements
│   ├── services/         # API clients (auto-generated)
│   └── types/            # TypeScript strict type declarations
├── tsconfig.json
├── package.json
└── next.config.js

gateway/
└── traefik.yml          # Traefik local routing rules

docker-compose.yml       # Orchestrates frontend, backend, postgres, redis, and traefik
.github/
└── workflows/
    └── ci.yml           # CI workflow (linting, tests, Trivy, SAST)
```

**Structure Decision**: Option 2 (Web application monorepo structure) is selected as it directly aligns with the Next.js frontend, Go backend, and Docker orchestration design.

## Complexity Tracking

No violations found. The architecture fully complies with the core principles of the project constitution.
