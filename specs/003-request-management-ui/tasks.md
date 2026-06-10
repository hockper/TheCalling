# Tasks: Request Management UI

**Input**: Design documents from `/specs/003-request-management-ui/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), data-model.md (optional)

**Tests**: Tests are not explicitly requested. Implementation verification will rely on manual validation steps as described in the "Independent Test" sections.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Validate compilation and baseline environment before making changes.

- [x] T001 Verify backend and frontend compilation by running docker-compose build in /home/hockper/Documents/TheCalling/docker-compose.yml
- [x] T002 Verify current OpenAPI client generation runs without errors in /home/hockper/Documents/TheCalling/frontend

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core backend implementation for listing users, and frontend API client regeneration.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T003 [P] Add GET /api/users endpoint to the OpenAPI spec contract in /home/hockper/Documents/TheCalling/openapi.yaml
- [x] T004 Add List/ListByRole function to the UserRepository interface in /home/hockper/Documents/TheCalling/backend/internal/domain/request.go
- [x] T005 Add postgres database list query implementation in /home/hockper/Documents/TheCalling/backend/internal/request/repository/user_repository.go
- [x] T006 Implement ListUsers API handler logic in UserHandler in /home/hockper/Documents/TheCalling/backend/internal/adapter/http/user.go
- [x] T007 Register GET /api/users route mapping in mux router in /home/hockper/Documents/TheCalling/backend/cmd/server/main.go
- [x] T008 Run code generation to regenerate client and types in /home/hockper/Documents/TheCalling/frontend

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Create Service Request Form (Priority: P1) 🎯 MVP

**Goal**: Requesters can submit a new service request with a title, description, priority, and assigned owner.

**Independent Test**: Log in as requester, click "+ New Request", fill out the form (selecting an assignee from the dropdown), and submit. Verify you are redirected to the My Requests page and the request appears there.

- [x] T009 [US1] Fetch available handlers from API to populate state in /home/hockper/Documents/TheCalling/frontend/src/app/requester/requests/new/page.tsx
- [x] T010 [US1] Replace assignee text input field with a dropdown selector populated with handlers in /home/hockper/Documents/TheCalling/frontend/src/app/requester/requests/new/page.tsx
- [x] T011 [US1] Add frontend form validations highlighting empty inputs with red borders in /home/hockper/Documents/TheCalling/frontend/src/app/requester/requests/new/page.tsx

**Checkpoint**: User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Requester Personal Request List (Priority: P2)

**Goal**: Requesters can view a list of only their own submitted requests and view read-only request details.

**Independent Test**: Log in as a requester, view the My Requests page. Verify only requests created by this user are shown. Click on a request and verify it opens a read-only details page showing ID, creation time, priority, status, and assignee.

- [x] T012 [P] [US2] Implement client-side pagination limit/offset and fetch requests in /home/hockper/Documents/TheCalling/frontend/src/app/requester/requests/page.tsx
- [x] T013 [P] [US2] Render read-only service request details and dates in /home/hockper/Documents/TheCalling/frontend/src/app/requester/requests/[id]/page.tsx

**Checkpoint**: User Stories 1 and 2 work independently.

---

## Phase 5: User Story 3 - Handler Queue Dashboard (Priority: P3)

**Goal**: Handlers can view all requests in the system sorted by creation date (newest first).

**Independent Test**: Log in as a handler. Navigate to the dashboard and confirm that requests from all requesters are displayed in a paginated list, sorted newest first.

- [x] T014 [P] [US3] Implement chronological descending sorting (newest first) for queue requests in /home/hockper/Documents/TheCalling/frontend/src/app/handler/dashboard/page.tsx
- [x] T015 [P] [US3] Implement pagination controls and next/prev click handlers in /home/hockper/Documents/TheCalling/frontend/src/app/handler/dashboard/page.tsx

**Checkpoint**: Handlers can successfully browse the global queue with pagination.

---

## Phase 6: User Story 4 - Handler Request Management (Priority: P4)

**Goal**: Handlers can view details of any service request and edit its status, priority, and assignee.

**Independent Test**: Log in as a handler, open any request from the dashboard, verify details match, click edit, change status, priority, or assignee, and save. Check that changes persist in detail view and queue.

- [x] T016 [P] [US4] Display service request creator and assignee detailed metadata in /home/hockper/Documents/TheCalling/frontend/src/app/handler/requests/[id]/page.tsx
- [x] T017 [US4] Query available handlers via GET /api/users to populate options state in /home/hockper/Documents/TheCalling/frontend/src/app/handler/requests/[id]/edit/page.tsx
- [x] T018 [US4] Convert assignee text input field into dynamic handler select dropdown in /home/hockper/Documents/TheCalling/frontend/src/app/handler/requests/[id]/edit/page.tsx
- [x] T019 [US4] Implement request patch api submission updating status, priority, and assignee in /home/hockper/Documents/TheCalling/frontend/src/app/handler/requests/[id]/edit/page.tsx

**Checkpoint**: Handlers can fully manage and assign any requests in the queue.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Access control, session expiry, UX polish, and navigation protections.

- [x] T020 Implement client role detection and dashboard page redirect on login in /home/hockper/Documents/TheCalling/frontend/src/app/page.tsx
- [x] T021 Implement layout role-based route guard blocking unauthorized views in /home/hockper/Documents/TheCalling/frontend/src/components/Navbar.tsx
- [x] T022 [P] Configure global request error handling in app layout to catch 401s and redirect to login in /home/hockper/Documents/TheCalling/frontend/src/app/layout.tsx
- [x] T023 Polish CSS dark-theme styling, glassmorphism card overlays, and transitions in /home/hockper/Documents/TheCalling/frontend

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories.
- **User Stories (Phase 3+)**: All depend on Foundational phase completion.
  - User Story 1 (P1) is the MVP and should be completed first.
  - User Stories 2, 3, and 4 are independent and can proceed in parallel (if staffed) or sequentially (P2 → P3 → P4).
- **Polish (Phase 7)**: Depends on all user stories being complete.

### Within Each User Story

- UI and fetching logic can be implemented in parallel if separated.
- Verify page functionality after completing the checkpoints.

### Parallel Opportunities

- Foundational database mapping (`T004`, `T005`) and contract spec updates (`T003`) can run in parallel.
- Once Foundation is complete, User Stories can be developed concurrently:
  - Developer A can work on US1/US2 (Requester flow).
  - Developer B can work on US3/US4 (Handler flow).

---

## Parallel Example: User Stories Development

```bash
# Launch Requester flow development:
Task: "Fetch available handlers from API to populate state in /home/hockper/Documents/TheCalling/frontend/src/app/requester/requests/new/page.tsx"
Task: "Implement client-side pagination limit/offset and fetch requests in /home/hockper/Documents/TheCalling/frontend/src/app/requester/requests/page.tsx"

# Launch Handler flow development concurrently:
Task: "Implement chronological descending sorting (newest first) for queue requests in /home/hockper/Documents/TheCalling/frontend/src/app/handler/dashboard/page.tsx"
Task: "Display service request creator and assignee detailed metadata in /home/hockper/Documents/TheCalling/frontend/src/app/handler/requests/[id]/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories).
3. Complete Phase 3: User Story 1.
4. **STOP and VALIDATE**: Test User Story 1 independently using the "Independent Test" criteria.

### Incremental Delivery

1. Foundation ready.
2. Add User Story 1 → Test independently → MVP!
3. Add User Story 2 (Requester tracking) → Test independently.
4. Add User Story 3 & 4 (Handler queue & management) → Test.
5. Add Polish (route protection, design tweaks).
