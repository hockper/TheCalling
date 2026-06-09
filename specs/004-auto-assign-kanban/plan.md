# Implementation Plan: Automatic Distribution and Kanban Dashboard

**Branch**: `003-request-management-ui` | **Date**: 2026-06-09 | **Spec**: [specs/004-auto-assign-kanban/spec.md](spec.md)

**Input**: Feature specification from `specs/004-auto-assign-kanban/spec.md`

## Summary

The system will automatically assign new requests to the active handler with the fewest open calls at the moment of creation. Handlers will manage these requests via a Kanban Dashboard with distinct status columns, featuring a toggle to view either solely their own assigned requests or all team requests.

## Technical Context

**Language/Version**: Go (Backend), TypeScript (Frontend)

**Primary Dependencies**: Next.js, React SWR (Polling), PostgreSQL, Redis, OpenAPI (Swagger)

**Storage**: PostgreSQL (for users, requests, and workload tracking)

**Testing**: Go testing package with mocks, Jest/React Testing Library

**Target Platform**: Linux server, Web browsers

**Project Type**: Web Application

**Performance Goals**: UI updates in under 1 second for toggling views and moving Kanban cards. Assignment execution in milliseconds.

**Constraints**: Must adhere to Clean Architecture principles in Go. Frontend must use strictly typed components.

**Scale/Scope**: Rendering up to 500 tasks simultaneously on the Kanban board without significant scroll lag.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Modular Monolith & Clean Architecture**: ✅ Validated. Auto-assignment logic will be encapsulated in a UseCase, decoupled from the HTTP delivery layer.
- **API Design-First**: ✅ Validated. A new OpenAPI contract is added for Kanban endpoints.
- **Type Safety & Componentization**: ✅ Validated. Kanban board components will be strictly typed in TypeScript.
- **DevSecOps**: ✅ Validated. Standard RBAC will govern who can view "All Requests" (assumed handlers have permission).
- **Local Execution**: ✅ Validated. Relying on Postgres and React SWR (polling) means `docker compose up` remains sufficient with no extra infra.
- **Secret Management**: ✅ Validated. No new secrets required for this feature.

## Project Structure

### Documentation (this feature)

```text
specs/004-auto-assign-kanban/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/kanban/
│   ├── pages/dashboard/
│   └── services/
└── tests/
```

**Structure Decision**: Option 2 (Web application) was selected because the project consists of a Go backend (Clean Architecture) and Next.js frontend, separated logically within the monorepo.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*No violations.*
