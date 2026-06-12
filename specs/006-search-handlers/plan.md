# Implementation Plan: Search and Filter Handlers

**Branch**: `006-search-handlers` | **Date**: 2026-06-11 | **Spec**: [spec.md](file:///home/hockper/Documents/TheCalling/specs/006-search-handlers/spec.md)

**Input**: Feature specification from `/specs/006-search-handlers/spec.md`

## Summary

Implement a robust search and filtering system for the Handler dashboard. This includes a debounced text search (querying title/description via SQL ILIKE), a multi-select Requester filter (populated with all users), and a multi-select Priority filter. Pagination will reset to page 1 upon filter changes to ensure consistent UX.

## Technical Context

**Language/Version**: Go (Backend), TypeScript/React (Frontend)

**Primary Dependencies**: Next.js (Frontend), pgx/sqlc (Backend Database), Vitest/Testing Library (Frontend tests), Go testing (Backend tests)

**Storage**: PostgreSQL

**Testing**: Go standard testing, Vitest

**Target Platform**: Web application (Next.js), Linux backend

**Project Type**: Full-stack web application

**Performance Goals**: <200ms latency for filtered queries on typical datasets.

**Constraints**: SQL ILIKE used for text search; array parameters used for multiple selection filters.

**Scale/Scope**: Handler dashboard filtering.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Modular Monolith & Clean Architecture**: Domain struct `ListRequestsFilter` extended. Handlers and repository updated without leaking HTTP details into domain. (PASSED)
- **API Design-First**: OpenAPI spec will be updated first to reflect array parameters and search. (PASSED)
- **Type Safety**: Frontend components will use strictly typed props based on updated OpenAPI client. (PASSED)
- **DevSecOps**: No new security risks; existing JWT auth remains. (PASSED)

## Project Structure

### Documentation (this feature)

```text
specs/006-search-handlers/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
backend/
├── internal/
│   ├── domain/
│   │   └── request.go (Update ListRequestsFilter)
│   ├── request/
│   │   ├── delivery/
│   │   │   └── request_handler.go (Parse new query params)
│   │   └── repository/
│   │       └── postgres_request.go (Update SQL query with ILIKE and IN clauses)
openapi.yaml (Update GET /requests contract)

frontend/
├── src/
│   ├── app/handler/dashboard/
│   │   └── page.tsx (Integrate new search bar and filters)
│   ├── components/
│   │   ├── DebouncedInput.tsx (New component for search)
│   │   ├── MultiSelect.tsx (New or reused component for Requester/Priority)
│   │   └── [Dashboard UI updates]
│   └── tests/
│       └── [Frontend tests for debounce and pagination reset]
```

**Structure Decision**: Web application layout (backend + frontend). Backend updates involve Clean Architecture layers (Delivery, Domain, Repository). Frontend updates involve Next.js pages and reusable React components.

## Complexity Tracking

No violations of the Constitution or unjustifiable complexity identified. ILIKE is chosen over tsvector specifically to keep complexity low.
