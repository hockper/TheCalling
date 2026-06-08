---
description: "Task list for Request Registration feature implementation"
---

# Tasks: Request Registration

**Input**: Design documents from `/specs/002-request-registration/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - only include them if explicitly requested in the feature specification. (None requested, so we focus on implementation and verification tasks).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/` and `frontend/`
- Paths are relative to the repository root.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic contract alignments.

- [x] T001 Merge `specs/002-request-registration/contracts/request_api.yaml` into `openapi.yaml` at root, adjusting security scheme to CookieAuth and adding `/api` prefix to paths
- [x] T002 Run client generator command `npm run generate-client` in `frontend/` to generate axios client and TypeScript interfaces in `frontend/src/services/api/client.ts`
- [x] T003 [P] Create initial database schema migration for `users` and `service_requests` tables in `backend/internal/adapter/db/migrations/000001_create_request_registration_tables.up.sql`
- [x] T004 Create database schema rollback migration in `backend/internal/adapter/db/migrations/000001_create_request_registration_tables.down.sql`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Setup migration runner or database schema logic to execute `000001_create_request_registration_tables.up.sql` on startup in `backend/internal/adapter/db/postgres.go`
- [x] T006 [P] Seed initial mock users (one Requester and one Handler) in `backend/internal/adapter/db/seeds/seed_users.sql` to support testing
- [x] T007 Implement authorization/authentication middleware in `backend/internal/middleware/auth.go` that decodes JWT cookie and injects user claims (id, email, role) into request context
- [x] T008 Update authentication handler in `backend/internal/adapter/http/user.go` to authenticate and return real users from the database instead of mocked developer info

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create a Service Request (Priority: P1) 🎯 MVP

**Goal**: Allow a logged-in Requester to create a new service request with Title, Description, Priority, and Assignee.

**Independent Test**: Log in as a Requester, fill out the new request form, submit it, and verify that the request is saved with status 'open' and the correct creator_id, and that the creation timestamp is set.

### Implementation for User Story 1

- [x] T009 [P] [US1] Define `User` and `Request` models in `backend/internal/domain/request.go`
- [x] T010 [P] [US1] Define `RequestRepository` and `RequestUsecase` interfaces in `backend/internal/domain/request.go`
- [x] T011 [US1] Implement SQL insert query for creating a service request in `backend/internal/request/repository/request_repository.go`
- [x] T012 [US1] Implement request creation logic, including input validation and default value generation, in `backend/internal/request/usecase/request_usecase.go`
- [x] T013 [US1] Implement HTTP handler for POST `/api/requests` in `backend/internal/request/delivery/request_handler.go` and register it in `backend/cmd/server/main.go`
- [x] T014 [P] [US1] Implement request creation form UI in `frontend/src/app/(requester)/requests/new/page.tsx` using modern glassmorphic styling
- [x] T015 [US1] Implement Requester's list of their own requests in `frontend/src/app/(requester)/requests/page.tsx`
- [x] T016 [US1] Update layout navigation to display Requester link to create and view requests in `frontend/src/app/layout.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - View and List Service Requests (Priority: P2)

**Goal**: Allow Handlers to see a paginated list of all requests and view full details, and allow Requesters to view details of their own requests.

**Independent Test**: Log in as a Handler, navigate to the dashboard, and verify all requests are listed with pagination. Click on a request and verify all details are correctly retrieved and shown.

### Implementation for User Story 2

- [x] T017 [US2] Implement SQL select queries for retrieving a single request by ID and listing requests (with offset pagination and filtering by creator) in `backend/internal/request/repository/request_repository.go`
- [x] T018 [US2] Implement list and detailed retrieval logic in `backend/internal/request/usecase/request_usecase.go`
- [x] T019 [US2] Implement HTTP handlers for GET `/api/requests` and GET `/api/requests/{id}` in `backend/internal/request/delivery/request_handler.go` and register them in `backend/cmd/server/main.go`
- [x] T020 [P] [US2] Implement Handler's dashboard UI showing all service requests in `frontend/src/app/(handler)/dashboard/page.tsx`
- [x] T021 [US2] Implement Handler's detailed request view UI in `frontend/src/app/(handler)/requests/[id]/page.tsx`
- [x] T022 [US2] Implement Requester's read-only detailed view UI in `frontend/src/app/(requester)/requests/[id]/page.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Edit a Service Request (Priority: P3)

**Goal**: Allow Handlers to edit request details, change status, and update assignees.

**Independent Test**: Log in as a Handler, select a request, update its status or assignee, save it, and verify that the changes are preserved and visible in the dashboard.

### Implementation for User Story 3

- [x] T023 [US3] Implement SQL update query for request properties in `backend/internal/request/repository/request_repository.go`
- [x] T024 [US3] Implement update request logic in `backend/internal/request/usecase/request_usecase.go`
- [x] T025 [US3] Implement HTTP handler for PATCH `/api/requests/{id}` in `backend/internal/request/delivery/request_handler.go` and register it in `backend/cmd/server/main.go`
- [x] T026 [US3] Implement edit form and status transition UI in `frontend/src/app/(handler)/requests/[id]/edit/page.tsx`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T027 [P] Update `README.md` and `specs/002-request-registration/quickstart.md` with instructions on local seeding and role selection
- [x] T028 Run docker container verification and health check integration validation to ensure all services connect and work cleanly
- [x] T029 Add integration tests for request creation, retrieval, and status updates in `backend/tests/request_test.go`

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

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all models/interfaces for User Story 1 together:
Task: "Define User and Request models in backend/internal/domain/request.go"
Task: "Define RequestRepository and RequestUsecase interfaces in backend/internal/domain/request.go"
Task: "Implement request creation form UI in frontend/src/app/(requester)/requests/new/page.tsx using modern glassmorphic styling"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
