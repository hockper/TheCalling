---
description: "Task list for Search and Filter Handlers feature implementation"
---

# Tasks: Search and Filter Handlers

**Input**: Design documents from `/specs/006-search-handlers/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Test tasks are included as requested in FR-008.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/internal/`, `frontend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Update OpenAPI contract to include `search`, `creator_id` array, and `priority` array in `openapi.yaml`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 Setup base `ListRequestsFilter` struct extensions in `backend/internal/domain/request.go`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Text Search with Debounce (Priority: P1) 🎯 MVP

**Goal**: As a Handler, I want to type keywords into a primary search input so that I can quickly find specific service requests by their title or description.

**Independent Test**: Type a keyword into the search bar, observe a debounce delay, and verify the list updates to show requests matching the keyword in title or description.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T003 [P] [US1] Create frontend test for DebouncedInput component in `frontend/src/components/DebouncedInput.test.tsx`
- [X] T004 [P] [US1] Update backend test for ILIKE text search in `backend/internal/request/repository/postgres_request_test.go`

### Implementation for User Story 1

- [X] T005 [P] [US1] Update `ListRequestsFilter` to include `Search` field in `backend/internal/domain/request.go`
- [X] T006 [P] [US1] Create DebouncedInput React component in `frontend/src/components/DebouncedInput.tsx`
- [X] T007 [US1] Update `listRequests` HTTP handler to parse `search` query parameter in `backend/internal/request/delivery/request_handler.go`
- [X] T008 [US1] Update PostgreSQL query builder to append ILIKE clause for search in `backend/internal/request/repository/postgres_request.go`
- [X] T009 [US1] Integrate DebouncedInput into Handler Dashboard in `frontend/src/app/handler/dashboard/page.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Filter by Requester (Priority: P2)

**Goal**: As a Handler, I want to filter the request queue by selecting one or multiple Requesters from a dropdown.

**Independent Test**: Open Requester dropdown, select one or more users, and verify displayed requests belong only to those creators.

### Tests for User Story 2 ⚠️

- [X] T010 [P] [US2] Update backend test for filtering by multiple creator IDs in `backend/internal/request/repository/postgres_request_test.go`

### Implementation for User Story 2

- [X] T011 [P] [US2] Update `ListRequestsFilter` struct to use `CreatorIDs` array in `backend/internal/domain/request.go`
- [X] T012 [P] [US2] Create or update MultiSelect React component in `frontend/src/components/MultiSelect.tsx`
- [X] T013 [US2] Update `listRequests` handler to parse multiple `creator_id` parameters in `backend/internal/request/delivery/request_handler.go`
- [X] T014 [US2] Update PostgreSQL query builder to use IN clause for creator IDs in `backend/internal/request/repository/postgres_request.go`
- [X] T015 [US2] Integrate Requester MultiSelect filter into Handler Dashboard in `frontend/src/app/handler/dashboard/page.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Filter by Priority (Priority: P2)

**Goal**: As a Handler, I want to filter requests by priority using multi-select chips or dropdown.

**Independent Test**: Select "High" priority and verify the queue shows only high-priority requests.

### Tests for User Story 3 ⚠️

- [X] T016 [P] [US3] Update backend test for filtering by multiple priorities in `backend/internal/request/repository/postgres_request_test.go`

### Implementation for User Story 3

- [X] T017 [P] [US3] Update `ListRequestsFilter` struct to include `Priorities` array in `backend/internal/domain/request.go`
- [X] T018 [US3] Update `listRequests` handler to parse multiple `priority` parameters in `backend/internal/request/delivery/request_handler.go`
- [X] T019 [US3] Update PostgreSQL query builder to use IN clause for priorities in `backend/internal/request/repository/postgres_request.go`
- [X] T020 [US3] Integrate Priority MultiSelect filter into Handler Dashboard in `frontend/src/app/handler/dashboard/page.tsx`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T021 Update frontend pagination logic to reset to page 1 on filter changes in `frontend/src/app/handler/dashboard/page.tsx`
- [X] T022 Update frontend test to verify pagination reset on filter change in `frontend/src/app/handler/dashboard/page.test.tsx`
- [X] T023 Run quickstart.md validation locally

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
- **User Story 2 (P2)**: Can start after Foundational (Phase 2)
- **User Story 3 (P2)**: Can start after Foundational (Phase 2)

### Parallel Opportunities

- All tests marked [P] can be written concurrently across stories.
- Domain struct changes (T005, T011, T017) can be done together or in parallel.
- React components (`DebouncedInput.tsx`, `MultiSelect.tsx`) can be developed in parallel to backend changes.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 & 2: Update OpenAPI and basic structures.
2. Complete Phase 3: Text Search (DebouncedInput, ILIKE).
3. **STOP and VALIDATE**: Test Text Search independently.

### Incremental Delivery

1. Add User Story 2 (Requester Filter) → Test independently.
2. Add User Story 3 (Priority Filter) → Test independently.
3. Complete Polish Phase (Pagination Reset) to ensure seamless UX.
