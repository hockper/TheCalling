# Tasks: Automatic Distribution and Kanban Dashboard

**Input**: Design documents from `/specs/004-auto-assign-kanban/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Test tasks are included as unit tests in backend/frontend to ensure correct functionality and clean architecture gates.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/`, `frontend/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Update API contract and generate updated clients

- [x] T001 Update OpenAPI contract to include Kanban and auto-assign parameters in openapi.yaml
- [x] T002 [P] Regenerate frontend API clients using Orval by running `npm run generate:api` in frontend/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database query implementation for workload calculation

- [x] T003 Implement `GetHandlerWithFewestRequests` query in backend/internal/request/repository/request_repository.go
- [x] T004 [P] Declare `GetHandlerWithFewestRequests` on `RequestRepository` in backend/internal/domain/request.go
- [x] T005 Support filtering by `assignee_id` and `scope` in `List` repository query in backend/internal/request/repository/request_repository.go
- [x] T006 [P] Add `AssigneeID` and `Scope` filter properties to `ListRequestsFilter` in backend/internal/domain/request.go

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Auto-Assign Request by Workload (Priority: P1) 🎯 MVP

**Goal**: Automatically assign incoming calls to the handler with the fewest open requests if no assignee is specified.

**Independent Test**: Send a POST request to `/api/requests` without `assignee_id`. Verify it returns `201 Created` with a resolved `assignee_id` indicating the handler with the lowest open call workload count.

### Implementation for User Story 1

- [x] T007 [P] [US1] Allow `AssigneeID` to be optional/nullable in `CreateRequestInput` in backend/internal/domain/request.go
- [x] T008 [US1] Modify `Create` usecase to query `GetHandlerWithFewestRequests` and assign it if input `AssigneeID` is empty in backend/internal/request/usecase/request_usecase.go
- [x] T009 [P] [US1] Write unit tests verifying auto-assignment logic in backend/internal/request/usecase/request_usecase_test.go
- [x] T010 [US1] Update API delivery handler to remove strict check for assignee in backend/internal/request/delivery/request_handler.go

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Kanban Dashboard Navigation (Priority: P1)

**Goal**: Display requests in a Kanban board style grouped by status (Open, In Progress, Resolved, Closed).

**Independent Test**: Navigate to `/handler/dashboard`. Observe cards grouped into 4 distinct status columns.

### Implementation for User Story 2

- [x] T011 [US2] Update request `List` usecase to support filtering by assignee in backend/internal/request/usecase/request_usecase.go
- [x] T012 [US2] Update list handler to parse query params and filter requests by assignee in backend/internal/request/delivery/request_handler.go
- [x] T013 [P] [US2] Create reusable Kanban board components `KanbanBoard.tsx`, `KanbanColumn.tsx`, and `KanbanCard.tsx` in frontend/src/components/kanban/
- [x] T014 [US2] Replace table layout with `KanbanBoard` component on the dashboard page in frontend/src/app/handler/dashboard/page.tsx
- [x] T015 [US2] Implement drag-and-drop state transitions that trigger a PATCH request to `/api/requests/{id}/status` in frontend/src/app/handler/dashboard/page.tsx

**Checkpoint**: At this point, User Stories 1 and 2 are fully functional

---

## Phase 5: User Story 3 - View All Requests Toggle (Priority: P2)

**Goal**: Allow handlers to see all requests (including unassigned and other handlers' requests) on the Kanban board.

**Independent Test**: Toggle the "View All" switch on the dashboard. Observe unassigned requests and requests assigned to other handlers appearing in the Kanban columns.

### Implementation for User Story 3

- [x] T016 [US3] Add `scope=all` query parameter handler in backend/internal/request/delivery/request_handler.go to skip assignee filtering for handlers
- [x] T017 [P] [US3] Create a `ToggleSwitch.tsx` component in frontend/src/components/common/ToggleSwitch.tsx
- [x] T018 [US3] Add `ToggleSwitch` to the dashboard layout and bind it to SWR request params to fetch all requests in frontend/src/app/handler/dashboard/page.tsx
- [x] T019 [US3] Update `KanbanCard.tsx` layout to display the assignee name or initials when the "View All" scope is active in frontend/src/components/kanban/KanbanCard.tsx

**Checkpoint**: All user stories are independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validation, testing, code quality

- [x] T020 Run `golangci-lint run` to verify Go code health in backend/
- [x] T021 [P] Run `npm run lint` and `npm run test` in frontend/
- [x] T022 Run quickstart validation steps to verify the entire flow locally

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1. Blocks all subsequent implementation.
- **User Story 1 (Phase 3)**: Depends on Phase 2. Can be implemented and verified first as MVP.
- **User Story 2 (Phase 4)**: Depends on Phase 2. Can run in parallel with US1.
- **User Story 3 (Phase 5)**: Depends on Phase 4. Integrates with the Kanban board from US2.
- **Polish (Phase 6)**: Depends on all implementation phases.

### Parallel Opportunities
- All Setup tasks marked [P] can run in parallel.
- All Foundational tasks marked [P] can run in parallel.
- US1 (Phase 3) and US2 (Phase 4) can be developed in parallel once Phase 2 is complete.

---

## Parallel Example: User Story 2

```bash
# Developer A starts UI layout:
Task: "Create Kanban board components in frontend/src/components/kanban/"

# Developer B starts Backend updates:
Task: "Update list handler to parse query params and filter requests by assignee in backend/internal/request/delivery/request_handler.go"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (Auto-Assign logic).
3. Verify backend auto-assignment via manual API tests.

### Incremental Delivery

1. Setup + Foundation ready.
2. Add Auto-assignment (US1) -> Verify backend.
3. Replace Table with Kanban (US2) -> Verify frontend board and drag-and-drop.
4. Add "View All" toggle (US3) -> Verify toggle and card assignee labels.
5. Final polish.
