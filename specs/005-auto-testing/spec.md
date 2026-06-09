# Feature Specification: Extensive Automatic Testing

**Feature Branch**: `005-auto-testing`

**Created**: 2026-06-09

**Status**: Draft

**Input**: User description: "Extensively Automatic Testing - Create tests for every thing on the project that covers different strategies. Automatically generate reports. Testing Scope: Different test strategies [Unit Tests / Integration Tests / E2E Tests / Black-Box Testing / White-Box Testing / Exploratory Testing / Performance Testing / Security Testing / Static Testing / Dynamic Testing]. Coverage Target: 80% branch and line coverage. Dependencies: Strictly mock all external APIs, databases, and file system calls OR spin up a test database using Docker/Testcontainers. Design Rules: AAA pattern, descriptive naming, comprehensive scenarios (edge cases, negative tests, exception handling), isolation with setup/teardown hooks."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Backend Unit Tests with Full Domain Coverage (Priority: P1) 🎯 MVP

A developer wants to run backend unit tests that cover all business logic in the usecase layer, domain validations, and utility functions so that any regressions are caught immediately during development.

**Why this priority**: Unit tests are the foundation of the testing pyramid. They are fast, cheap, isolated, and provide immediate feedback. Without them, no other test strategy is reliable.

**Independent Test**: Can be fully tested by running `go test ./...` in the backend directory. Each test validates a single unit of business logic with mocked dependencies and follows the Arrange-Act-Assert pattern.

**Acceptance Scenarios**:

1. **Given** the request usecase module exists, **When** the developer runs unit tests, **Then** all business logic paths (create, read, update, list, auto-assign) are covered including happy paths, validation errors, not-found conditions, and permission checks.
2. **Given** domain types (Priority, Status, Role) exist, **When** unit tests run, **Then** all validation methods are tested for valid values, invalid values, and boundary conditions.
3. **Given** the authentication middleware exists, **When** unit tests run, **Then** JWT parsing, token expiry, missing tokens, malformed tokens, and role extraction are all verified.
4. **Given** the health check handler exists, **When** unit tests run, **Then** healthy, partially degraded, and fully offline scenarios are all covered.
5. **Given** the user handler exists, **When** unit tests run, **Then** login success, login with wrong credentials, registration, password hashing, and user listing are all tested.
6. **Given** any test function, **When** it executes, **Then** it follows the Arrange-Act-Assert pattern with descriptive naming (e.g., `TestCreateRequest_Should_Return_Error_When_Title_Is_Empty`).

---

### User Story 2 - Backend Integration Tests with Dockerized Database (Priority: P1)

A developer wants to run integration tests that verify the interaction between the repository layer and a real PostgreSQL database so that SQL queries, schema migrations, and data integrity are validated against a real database engine.

**Why this priority**: Integration tests catch issues that unit tests with mocks cannot: incorrect SQL syntax, constraint violations, transaction behavior, and ORM-to-schema mismatches.

**Independent Test**: Can be tested by spinning up a PostgreSQL container programmatically via Testcontainers (Go), running migrations, executing repository operations, and verifying data persistence.

**Acceptance Scenarios**:

1. **Given** a PostgreSQL test container is running via Testcontainers, **When** the `RequestRepository.Create` method is called, **Then** the request is persisted and can be retrieved by ID with all fields intact.
2. **Given** multiple handlers with varying open request counts, **When** `GetHandlerWithFewestRequests` is called, **Then** the handler with the fewest open (non-closed, non-resolved) requests is returned.
3. **Given** filter parameters (assignee, scope, pagination), **When** `RequestRepository.List` is called, **Then** results are correctly filtered, paginated, and sorted.
4. **Given** an update with partial fields, **When** `RequestRepository.Update` is called, **Then** only the specified fields change while others remain untouched.
5. **Given** a test completes, **When** the teardown runs, **Then** all test data is cleaned up and the database state does not leak between tests.

---

### User Story 3 - Frontend Component Unit Tests (Priority: P1)

A developer wants to run frontend unit tests for all React components so that rendering logic, state management, event handling, and conditional UI are validated independently from the backend.

**Why this priority**: Frontend components are the primary user-facing surface. Broken components mean broken user experience.

**Independent Test**: Can be tested by running `npm test` in the frontend directory. Each component renders in isolation using a test renderer with mocked API calls and context providers.

**Acceptance Scenarios**:

1. **Given** the Login component, **When** rendered, **Then** it shows email and password fields, a submit button, handles validation errors for empty fields, and calls the login API on submission.
2. **Given** the KanbanBoard component, **When** rendered with request data, **Then** requests are grouped into correct status columns (Open, In Progress, Resolved, Closed).
3. **Given** the KanbanCard component, **When** rendered with an assigneeName prop, **Then** it displays the assignee badge; when without, it shows the default avatar icon.
4. **Given** the ToggleSwitch component, **When** toggled, **Then** the onChange callback fires with the new boolean value and the visual state updates.
5. **Given** the Navbar component, **When** rendered for a handler role, **Then** it shows handler-specific navigation links; when rendered for a requester, it shows requester-specific links.
6. **Given** the New Request form page, **When** submitted without a title, **Then** a validation error is displayed and the API is not called.

---

### User Story 4 - End-to-End Tests for Critical User Journeys (Priority: P2)

A quality assurance stakeholder wants end-to-end tests that simulate complete user workflows through the browser so that the entire system (frontend + backend + database) is validated as a cohesive unit.

**Why this priority**: E2E tests validate the "real" user experience but are slower and more brittle. They should cover the most critical paths.

**Independent Test**: Can be tested by starting the full Docker Compose stack and running browser automation via Playwright to simulate login, request creation, Kanban interaction, and request updates.

**Acceptance Scenarios**:

1. **Given** the full application is running, **When** a requester logs in via Playwright, creates a new request without selecting an assignee, **Then** the request appears in the request list with an auto-assigned handler.
2. **Given** a handler is logged in, **When** Playwright navigates them to the Kanban dashboard, toggles "Show All Requests", and drags a card from "Open" to "In Progress", **Then** the request status is updated in the database and reflected on refresh.
3. **Given** a user with invalid credentials, **When** Playwright attempts to log in, **Then** an error message is displayed and they remain on the login page.
4. **Given** an unauthenticated user, **When** Playwright attempts to access a protected route, **Then** they are redirected to the login page.

---

### User Story 5 - Security Testing and Static Analysis (Priority: P2)

A security-conscious stakeholder wants automated security scans that detect common vulnerabilities (injection, broken auth, sensitive data exposure) and enforce secure coding practices through static analysis.

**Why this priority**: The constitution mandates DevSecOps and shift-left security. Security testing prevents vulnerabilities from reaching production.

**Independent Test**: Can be tested by running static analysis tools against the codebase and reviewing their reports for critical and high-severity findings.

**Acceptance Scenarios**:

1. **Given** the backend codebase, **When** Go static analysis runs, **Then** no SQL injection vulnerabilities, hardcoded secrets, or insecure cryptographic usage is flagged.
2. **Given** the frontend codebase, **When** ESLint security rules run, **Then** no XSS vulnerabilities, unsafe `dangerouslySetInnerHTML` usage, or exposed secrets are detected.
3. **Given** Docker images for all services, **When** container vulnerability scanning runs, **Then** no critical-severity CVEs are present in the base images.
4. **Given** JWT authentication, **When** security tests run, **Then** token forgery, expired tokens, and tampered payloads are all correctly rejected.

---

### User Story 6 - Performance Testing Under Load (Priority: P3)

An operations stakeholder wants performance benchmarks using Grafana k6 to ensure the system handles expected concurrent load without degradation, particularly for the auto-assignment and Kanban listing endpoints.

**Why this priority**: Performance issues may not surface under light development loads but become critical in production.

**Independent Test**: Can be tested by running a k6 script against the API endpoints with simulated concurrent users and measuring response times and error rates.

**Acceptance Scenarios**:

1. **Given** 100 concurrent users making requests, **When** the k6 load test runs against the request listing endpoint, **Then** 95th percentile response time is below 500 milliseconds.
2. **Given** 50 concurrent request creation calls with auto-assignment, **When** the k6 load test runs, **Then** no two requests are assigned to the same handler if another handler has fewer open requests (race condition protection).
3. **Given** the Kanban dashboard loading 500 requests, **When** the page renders, **Then** the time to interactive is under 3 seconds.

---

### User Story 7 - Automated Test Report Generation (Priority: P2)

A developer or CI/CD pipeline wants automatically generated test reports after every test run so that test results, coverage metrics, and trends are visible without manual inspection.

**Why this priority**: Reports provide visibility into test health, enable coverage tracking toward the 80% target, and support quality gate enforcement.

**Independent Test**: Can be tested by running the test suite and verifying that machine-readable and human-readable reports are produced in the expected output directory.

**Acceptance Scenarios**:

1. **Given** backend tests complete, **When** the report generator runs, **Then** a coverage report is produced showing line and branch coverage percentages per package.
2. **Given** frontend tests complete, **When** the report generator runs, **Then** a coverage report is produced showing line and branch coverage percentages per file.
3. **Given** any test suite run, **When** the test runner completes, **Then** a summary report is generated listing total tests, passed, failed, skipped, and overall coverage against the 80% target.
4. **Given** a CI/CD pipeline, **When** coverage drops below 80% on any covered module, **Then** the pipeline reports a warning with specific files that need additional coverage.

### Edge Cases

- What happens when the Docker test database fails to start or is unreachable during integration tests?
- How does the system handle flaky E2E tests caused by timing or animation delays?
- What happens when a test file accidentally imports a production dependency that has side effects (e.g., connecting to a real database)?
- How are tests handled for auto-generated Orval client code (should they be excluded from coverage)?
- What happens when performance tests run on underpowered CI runners with limited CPU/memory?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a backend unit test suite that covers all usecase, domain validation, middleware, and handler logic with mocked dependencies following the Arrange-Act-Assert pattern.
- **FR-002**: System MUST provide backend integration tests that run against a real PostgreSQL instance spun up programmatically via Testcontainers (Go), covering all repository methods.
- **FR-003**: System MUST provide frontend unit tests for all React components (Login, Navbar, KanbanBoard, KanbanColumn, KanbanCard, ToggleSwitch) and all page components using a test renderer with mocked API calls.
- **FR-004**: System MUST provide end-to-end tests via Playwright for critical user journeys: login, request creation (with and without auto-assign), Kanban navigation, drag-and-drop status change, and view-all toggle.
- **FR-005**: System MUST use descriptive test naming conventions (e.g., `should_return_400_when_email_is_invalid`) across all test suites.
- **FR-006**: System MUST include negative tests (invalid inputs, unauthorized access), edge cases (empty strings, null values, max lengths), and exception handling tests in every test module.
- **FR-007**: System MUST ensure test isolation via setup/teardown hooks that clean up mocks, database state, and global state between test runs.
- **FR-008**: System MUST generate coverage reports showing line and branch coverage percentages, targeting at least 80% coverage.
- **FR-009**: System MUST generate human-readable test result reports (pass/fail/skip counts, duration, per-module breakdown) after every test suite execution.
- **FR-010**: System MUST run static analysis on the backend (Go vet, golangci-lint) and frontend (ESLint with security rules) as part of the testing pipeline.
- **FR-011**: System MUST run container vulnerability scanning on Docker images to detect critical CVEs.
- **FR-012**: System MUST provide performance/load tests via Grafana k6 for the most critical API endpoints (request listing, request creation with auto-assign) measuring response times under concurrent load.
- **FR-013**: System MUST exclude auto-generated files (e.g., Orval API clients in `frontend/src/services/api/`) from coverage calculations.
- **FR-014**: System MUST strictly mock all external API calls, database connections, and file system operations in unit tests to ensure isolation and speed.

### Key Entities

- **Test Suite**: A collection of related test cases grouped by module, layer, or user story. Has attributes: name, type (unit/integration/E2E/security/performance), coverage percentage, pass rate.
- **Test Report**: An automatically generated document summarizing test execution results. Has attributes: total tests, passed, failed, skipped, coverage percentage, duration, timestamp.
- **Coverage Target**: A threshold (80% line and branch coverage) that must be met for the test suite to be considered passing. Tracked per module and overall.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Backend unit test coverage reaches at least 80% line and branch coverage across all non-generated packages.
- **SC-002**: Frontend component test coverage reaches at least 80% line and branch coverage across all non-generated source files.
- **SC-003**: All integration tests pass against a Dockerized PostgreSQL instance with zero data leakage between test cases.
- **SC-004**: End-to-end tests complete the four critical user journeys (login, create request, Kanban navigation, status update) with a 95% pass rate on repeated runs.
- **SC-005**: Static analysis reports zero critical or high-severity security findings across backend and frontend codebases.
- **SC-006**: Performance tests confirm 95th percentile response times under 500ms for listing endpoints with 100 concurrent users.
- **SC-007**: Test reports are automatically generated after every test suite run and include per-module coverage breakdowns.
- **SC-008**: Every test function follows the Arrange-Act-Assert pattern with descriptive naming that communicates intent without reading the test body.

## Assumptions

- The existing project structure (Go backend with Clean Architecture, Next.js frontend, Docker Compose orchestration) will not change during test implementation.
- Auto-generated Orval client files (`frontend/src/services/api/client.ts`, `frontend/src/services/api/model/`) are excluded from coverage requirements since they are machine-generated.
- Integration tests will use a separate PostgreSQL container from the development database to avoid data corruption.
- E2E tests will run against the full Docker Compose stack started via `docker compose up`.
- Performance test baselines (500ms p95, 100 concurrent users) reflect expected production load and may be adjusted after initial benchmarking.
- The CI/CD environment (GitHub Actions) has sufficient resources to run Dockerized integration tests and E2E browser automation.
- Security scanning tools (golangci-lint for Go, ESLint security plugin for JS, Trivy for containers) are available or can be installed via Docker.
- The 80% coverage target applies to source code written by developers, not to framework boilerplate, configuration files, or auto-generated code.

## Clarifications
### Session 2026-06-09
- Q: For End-to-End (E2E) browser automation tests, which framework should we use? → A: Playwright (Microsoft)
- Q: For Performance Testing, which load testing tool should we use to measure the API endpoints? → A: k6 (Grafana)
- Q: For Backend Integration Tests, how should the real PostgreSQL database be provisioned dynamically during the test run? → A: Testcontainers (Go)
