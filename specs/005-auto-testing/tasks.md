---
description: "Tasks for Extensive Automatic Testing implementation"
---

# Tasks: Extensive Automatic Testing

**Input**: Design documents from `/specs/005-auto-testing/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Tests are requested explicitly in the feature specification (TDD approach where tests are written and verified first).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/internal/`, `frontend/src/`
- Paths below reflect the workspace layout

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic testing framework setup

- [X] T001 [P] Install and configure frontend testing framework (Vitest, RTL, jsdom) in frontend/package.json
- [X] T002 [P] Add testcontainers-go and Go mock/assert dependencies to backend/go.mod
- [X] T003 [P] Configure linting and formatting tool environments in frontend/.eslintrc.json and backend/.golangci.yml

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core testing utility structure that MUST be complete before user stories can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 [P] Create database migration and seeding utility for testing in backend/internal/adapter/db/test_db_helper.go
- [X] T005 [P] Setup shared environment configuration manager for test context in backend/internal/adapter/config/test_config.go
- [X] T006 [P] Implement repository mock utilities to isolate unit tests from DB in backend/internal/request/repository/mock_repository.go

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Backend Unit Tests with Full Domain Coverage (Priority: P1) 🎯 MVP

**Goal**: Validate request creation, listing, retrieval, update, auto-assignment, and middleware isolation with unit tests.

**Independent Test**: Run `go test -v ./internal/...` in the backend directory.

### Implementation for User Story 1

- [X] T007 [P] [US1] Write unit tests for domain request validations in backend/internal/domain/request_test.go
- [X] T008 [P] [US1] Write unit tests for JWT parser and role extractor middleware in backend/internal/middleware/auth_test.go
- [X] T009 [P] [US1] Write unit tests for request usecase with mocked repositories in backend/internal/request/usecase/request_usecase_test.go
- [X] T010 [P] [US1] Write unit tests for HTTP request handler endpoints in backend/internal/request/delivery/request_handler_test.go
- [X] T011 [P] [US1] Write unit tests for user authentication HTTP handlers in backend/internal/adapter/http/user_test.go
- [X] T012 [P] [US1] Write unit tests for health check endpoints in backend/internal/adapter/http/health_test.go

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Backend Integration Tests with Dockerized Database (Priority: P1)

**Goal**: Verify SQL queries, schema, and repository operations against PostgreSQL container.

**Independent Test**: Run `go test -v ./tests/integration/...` in the backend directory.

### Implementation for User Story 2

- [X] T013 [US2] Setup Testcontainers-go PostgreSQL lifecycle manager in backend/tests/integration/postgres_setup.go
- [X] T014 [US2] Write repository integration tests for RequestRepository in backend/tests/integration/request_repository_test.go
- [X] T015 [US2] Write repository integration tests for UserRepository in backend/tests/integration/user_repository_test.go

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Frontend Component Unit Tests (Priority: P1)

**Goal**: Render and test state, navigation, and events in React UI components and pages.

**Independent Test**: Run `npm test` in the frontend directory.

### Implementation for User Story 3

- [X] T016 [P] [US3] Write unit tests for Login component in frontend/src/components/Login.test.tsx
- [X] T017 [P] [US3] Write unit tests for Navbar component in frontend/src/components/Navbar.test.tsx
- [X] T018 [P] [US3] Write unit tests for KanbanBoard component in frontend/src/components/kanban/KanbanBoard.test.tsx
- [X] T019 [P] [US3] Write unit tests for KanbanColumn component in frontend/src/components/kanban/KanbanColumn.test.tsx
- [X] T020 [P] [US3] Write unit tests for KanbanCard component in frontend/src/components/kanban/KanbanCard.test.tsx
- [X] T021 [P] [US3] Write unit tests for ToggleSwitch component in frontend/src/components/common/ToggleSwitch.test.tsx
- [X] T022 [P] [US3] Write unit tests for New Request form page component in frontend/src/app/requester/requests/new/page.test.tsx

**Checkpoint**: User Stories 1, 2, and 3 are all independently verified

---

## Phase 6: User Story 4 - End-to-End Tests for Critical User Journeys (Priority: P2)

**Goal**: Simulate end-to-end user journeys (auth, request create, drag-and-drop Kanban updates) in a browser.

**Independent Test**: Run `npx playwright test` under `frontend/` directory with Docker Compose up.

### Implementation for User Story 4

- [X] T023 [US4] Configure Playwright configuration and test fixtures in frontend/playwright.config.ts
- [X] T024 [US4] Write E2E login and route redirection tests in frontend/tests/e2e/auth.spec.ts
- [X] T025 [US4] Write E2E request creation and auto-assignment tests in frontend/tests/e2e/request.spec.ts
- [X] T026 [US4] Write E2E Kanban board drag-and-drop and filter tests in frontend/tests/e2e/kanban.spec.ts

**Checkpoint**: Browser automation runs end-to-end successfully

---

## Phase 7: User Story 5 - Security Testing and Static Analysis (Priority: P2)

**Goal**: Run SAST scanners, ESLint plugins, container scans, and test authentication logic boundaries.

**Independent Test**: Execute the lint/scan commands locally and view security results.

### Implementation for User Story 5

- [X] T027 [P] [US5] Add security rules and exclusions to ESLint configuration in frontend/.eslintrc.json
- [X] T028 [P] [US5] Add Go vet, staticcheck, and security linter settings to backend/.golangci.yml
- [X] T029 [P] [US5] Create shell script to run Trivy scanner on backend and frontend Docker images in scripts/scan-images.sh
- [X] T030 [US5] Write a JWT security test that verifies token forgery and expiry handling in backend/internal/middleware/security_test.go

**Checkpoint**: All static checkers and vulnerability tools pass with zero critical issues

---

## Phase 8: User Story 6 - Performance Testing Under Load (Priority: P3)

**Goal**: Verify listing and request creation endpoints meet p95 < 500ms requirements under load.

**Independent Test**: Run `k6 run load.js` in the performance test directory.

### Implementation for User Story 6

- [X] T031 [US6] Implement k6 load test script simulating 100 concurrent users in backend/tests/performance/load.js

**Checkpoint**: Performance limits are validated and within targets

---

## Phase 9: User Story 7 - Automated Test Report Generation (Priority: P2)

**Goal**: Aggregate unit, integration, and security results and enforce the 80% coverage check.

**Independent Test**: Execute report runner and confirm formatted reports are created.

### Implementation for User Story 7

- [X] T032 [US7] Write shell script to run all tests and generate a combined coverage and test report in scripts/run-all-tests.sh
- [X] T033 [US7] Setup coverage check failure logic when line/branch coverage drops below 80% in scripts/check-coverage.sh

**Checkpoint**: Reports generated automatically with coverage checks working

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: General cleanup, doc synchronization, and final run validation

- [X] T034 [P] Update Automated Testing Quickstart documentation in specs/005-auto-testing/quickstart.md
- [X] T035 Clean up temporary test cache files in backend/tests/
- [X] T036 Execute verification run using scripts/run-all-tests.sh to ensure all suites pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Usecase & handler unit testing. No dependencies on other stories.
- **User Story 2 (P1)**: Database repository testing. No dependencies on other stories.
- **User Story 3 (P1)**: React component unit tests. No dependencies on other stories.
- **User Story 4 (P2)**: E2E Playwright tests. Requires backend & frontend to compile and run (depends on US1/US2/US3).
- **User Story 5 (P2)**: Security & static scan. Depends on Go/JS setups (Phase 1).
- **User Story 6 (P3)**: k6 load test. Requires running app (depends on US4 stack config).
- **User Story 7 (P2)**: Report aggregation. Depends on all other test outputs.

### Parallel Opportunities

- Setup tasks (T001-T003) and Foundational tasks (T004-T006) marked with `[P]` can run in parallel.
- US1 (Backend Unit Tests) and US3 (Frontend Unit Tests) can run entirely in parallel as they touch independent codebases.
- US5 (Static Analysis configuration) can be done in parallel with testing implementation.

---

## Parallel Example: User Story 1 & User Story 3

```bash
# Developer A working on Backend Unit Tests:
Task T009: Write unit tests for request usecase in backend/internal/request/usecase/request_usecase_test.go

# Developer B working on Frontend Component Tests:
Task T016: Write unit tests for Login component in frontend/src/components/Login.test.tsx
```

---

## Implementation Strategy

### MVP First (User Story 1, 2 & 3)

1. Complete Phase 1: Setup and Phase 2: Foundational.
2. Complete Phase 3 (US1), Phase 4 (US2), and Phase 5 (US3).
3. **STOP and VALIDATE**: Verify local unit and integration tests run successfully, coverage reaches 80%.

### Incremental Delivery

1. Setup + Foundation -> Testing base config ready.
2. Add US1, US2, US3 -> Validate locally -> MVP Done.
3. Add US4 (E2E) -> Test complex browser interactions.
4. Add US5, US6, US7 -> Hardening, load tests, and reporting integration.
