# Feature Specification: Request Management UI

**Feature Branch**: `003-request-management-ui`

**Created**: 2026-06-06

**Status**: Draft

**Input**: User description: "Frontend website for making, viewing and managing requests. It depends on specs/002-request-registration/spec.md. It must integranted with the rest of the projecto. Must be secure and stable. Must follow good UX principles."

## Clarifications

### Session 2026-06-06

- Q: How should the frontend retrieve the list of available users/handlers to populate the Assignee selection dropdown? → A: Update the openapi.yaml contract to expose GET /api/users and fetch handlers dynamically.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Service Request Form (Priority: P1)

As a Requester, I want to submit a new service request with a title, description, priority, and assigned owner so that the issue can be tracked.

**Why this priority**: Requesters need a simple, self-service entry point to document issues; without this form, no requests can be initiated.

**Independent Test**: Can be tested by logging in as a Requester, navigating to the creation page, filling in the fields, and submitting. The request should be saved with an "open" status and the user redirected to their personal request list.

**Acceptance Scenarios**:

1. **Given** I am logged in as a Requester and am on the request creation screen, **When** I submit a form with a valid Title, Description, Priority, and Assignee, **Then** the request is successfully saved, a success notification appears, and I am redirected to my requests view.
2. **Given** I am on the request creation screen, **When** I leave the Title field empty and press submit, **Then** the form submission is blocked and a clear validation error is displayed below the Title field.

---

### User Story 2 - Requester Personal Request List (Priority: P2)

As a Requester, I want to view a list of all requests that I have submitted, showing their current status.

**Why this priority**: Requesters must be able to track the lifecycle of the issues they raised without having administrative access to other users' requests.

**Independent Test**: Can be tested by logging in as a Requester and viewing the request dashboard to verify that only requests created by that user are shown.

**Acceptance Scenarios**:

1. **Given** there are requests created by multiple users, **When** I view my request list as a Requester, **Then** I only see the requests I personally created.
2. **Given** I am a Requester viewing my requests, **When** I click on one of my requests, **Then** I am shown a read-only detailed view of its status, priority, description, and creation time.

---

### User Story 3 - Handler Queue Dashboard (Priority: P3)

As a Handler, I want to see a global dashboard listing all service requests in the system.

**Why this priority**: Handlers are responsible for managing and triaging the entire system queue; they need a central control panel to scan the active workload.

**Independent Test**: Can be tested by logging in as a Handler, navigating to the dashboard, and confirming that requests from all creators are displayed.

**Acceptance Scenarios**:

1. **Given** multiple users have submitted requests, **When** I view the dashboard as a Handler, **Then** I see a paginated list of all requests in the system sorted by creation date (newest first).
2. **Given** I am on the Handler dashboard, **When** I click on any service request in the list, **Then** I am navigated to its management detail view.

---

### User Story 4 - Handler Request Management (Priority: P4)

As a Handler, I want to view the details of a service request and edit its status, priority, and assignee.

**Why this priority**: Allows Handlers to act on requests (assigning them, updating progress, and resolving issues).

**Independent Test**: Can be tested by selecting an open request, modifying the status to "in progress", saving, and verifying that the updated status is displayed on the list and detail views.

**Acceptance Scenarios**:

1. **Given** I am viewing a request detail page as a Handler, **When** I change the status from "open" to "in progress" and save, **Then** the system updates the status and shows a confirmation message.
2. **Given** I am viewing a request detail page as a Handler, **When** I choose a different assignee from the handler list and save, **Then** the request reflects the new assignee immediately.

### Edge Cases

- **Session Expiry**: A user attempts to submit a new request or save edits after their login session has expired. The system must capture this, block the submission, display an error message, and redirect them to the login page.
- **Unprivileged Navigation**: A Requester manually enters the URL path for the Handler dashboard. The system must intercept this, deny access, and redirect them back to the Requester dashboard.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: **Authentication Gate**: All application pages (except login/logout) MUST require active user authentication. Unauthenticated users must be redirected to the login screen.
- **FR-002**: **Role-Based Redirection**: Upon successful authentication, the system MUST route Requesters to the Requester request list, and Handlers to the global queue dashboard.
- **FR-003**: **Access Control**: Users with the Requester role MUST NOT be allowed to load the Handler dashboard or edit request details. Handlers MUST NOT be allowed to create requests.
- **FR-004**: **Request Submission**: Requesters MUST have access to a creation screen containing:
  - Title input field (mandatory, max 255 characters)
  - Description textarea (mandatory)
  - Priority dropdown select (mandatory; low, medium, high)
  - Assignee dropdown select (mandatory)
- **FR-005**: **Global Request Queue**: Handlers MUST be shown a dashboard listing all requests in a table showing title, status, priority, creator name, assignee name, and creation date.
- **FR-006**: **Pagination**: The request list tables for both Requesters and Handlers MUST support pagination (with configurable page size) to support large request datasets.
- **FR-007**: **Request Editor**: Handlers MUST have access to an edit screen for any request where they can update:
  - Status (open, in progress, resolved, closed)
  - Priority (low, medium, high)
  - Assignee (selected from a list of users with the Handler role)
- **FR-008**: **Form Validation**: Fields marked as mandatory must be validated client-side before form submission, highlighting invalid inputs with red outlines and helper text.
- **FR-009**: **Dynamic Assignee Loading**: The Assignee select dropdown MUST dynamically populate its list of options by querying the `GET /api/users` endpoint.

### Key Entities

- **User**: Represents an actor in the system. Key attributes: ID, Name, Email, Role (Requester or Handler).
- **Service Request**: Represents a task, issue, or request. Key attributes: ID, Title, Description, Priority (low, medium, high), Status (open, in progress, resolved, closed), Creator, Assignee, Created Date, Last Updated Date.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can load the login page and authenticate in under 2 seconds under normal network conditions.
- **SC-002**: Requesters can fill out and submit a request creation form in under 1 minute.
- **SC-003**: Handlers can locate and view the full details of any request from the queue in under 3 clicks from the main dashboard.
- **SC-004**: 100% of unauthorized route access attempts (e.g., Requesters accessing Handler paths) are blocked and redirected within 200ms.

## Assumptions

- The backend APIs for login, logout, user profile fetch, list users, create request, list requests, and update request are already fully defined and implemented.
- Authentication status is checked by fetching the current session profile on initial app load and subsequent route changes.
- The UI follows a dark-themed, modern dashboard aesthetic with glassmorphism overlays and smooth transition animations.
