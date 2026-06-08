# Feature Specification: Request Registration

**Feature Branch**: `002-request-registration`

**Created**: 2026-06-06

**Status**: Draft

**Input**: User description: "The application should allow for the registration, editing, listing, and viewing of service requests. Each request must include, at a minimum: Title, Description, Priority (low, medium, high), Status (e.g., open, in progress, resolved, closed), Person responsible for handling the request, Date and time of opening."

## Clarifications

### Session 2026-06-06
- Q: How should the system handle the assignment of a person responsible for the request? → A: Reference to a User entity.
- Q: Can a request transition freely between any status, or is there a strict lifecycle workflow? → A: Free transitions.
- Q: Should the API and UI support pagination for the request list immediately? → A: Implement pagination.
- Q: Should Requesters be able to view the status of the specific requests they have personally created? → A: View own requests.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create a Service Request (Priority: P1)

As a Requester, I want to create a new service request so that an issue or task can be tracked and assigned.

**Why this priority**: Creating requests is the fundamental action of the system; without it, there is nothing to track or manage.

**Independent Test**: Can be fully tested by logging in as a Requester, submitting a valid form, and verifying the request is saved with the correct initial state.

**Acceptance Scenarios**:

1. **Given** I am logged in as a Requester on the new request creation page, **When** I fill in the Title, Description, Priority, and Assignee and submit, **Then** the request is saved successfully, the "Date and time of opening" is automatically recorded, and the status defaults to "open".
2. **Given** I am logged in as a Requester on the new request creation page, **When** I submit without a Title, **Then** I am shown an error message and the request is not saved.
3. **Given** I am logged in as a Requester, **When** I attempt to view the general request list, **Then** I am denied access.
4. **Given** I am logged in as a Requester, **When** I navigate to my personal requests view, **Then** I can see all requests I have created and their current status.

---

### User Story 2 - View and List Service Requests (Priority: P2)

As a Handler, I want to see a list of all service requests and view their full details, so that I know what tasks are currently in the system.

**Why this priority**: Once requests exist, handlers must be able to discover them and read their details to understand the workload.

**Independent Test**: Can be fully tested by logging in as a Handler, navigating to the request list and verifying that existing records are displayed accurately.

**Acceptance Scenarios**:

1. **Given** there are existing service requests in the system, **When** I log in as a Handler and navigate to the request list, **Then** I see a summary of all requests including their titles, statuses, and assignees.
2. **Given** I am a Handler viewing the request list, **When** I click on a specific request, **Then** I am shown the full details including description, priority, and exact creation time.

---

### User Story 3 - Edit a Service Request (Priority: P3)

As a Handler, I want to edit an existing service request to update its status or modify details as the work progresses.

**Why this priority**: Essential for the lifecycle of a request, allowing it to transition from "open" to "resolved" or "closed".

**Independent Test**: Can be fully tested by selecting an existing request, changing its status, and verifying the new status is saved.

**Acceptance Scenarios**:

1. **Given** I am viewing an existing request, **When** I update the Status from "open" to "in progress" and save, **Then** the new status is reflected in the system.
2. **Given** I am editing a request, **When** I change the assigned person, **Then** the request reflects the new assignee.

### Edge Cases

- What happens when a user tries to assign a request to a non-existent person?
- How does system handle concurrent edits to the same service request?
- What happens if a user submits extremely long text for the description?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support two distinct user roles: 'Requester' (can only create requests) and 'Handler' (can view and edit requests).
- **FR-002**: System MUST allow 'Requester' users to create new service requests containing a Title, Description, Priority (low, medium, high), and Person responsible.
- **FR-003**: System MUST automatically record the exact Date and time of opening when a request is created.
- **FR-004**: System MUST automatically set the initial Status of a newly created request to 'open'.
- **FR-005**: System MUST allow 'Handler' users to view a paginated list summarizing all existing service requests to ensure scalability.
- **FR-006**: System MUST allow 'Handler' users to view the complete detailed view of any specific service request.
- **FR-007**: System MUST allow 'Handler' users to edit the properties of an existing service request.
- **FR-008**: System MUST support transitioning the Status field freely between any predefined states (open, in progress, resolved, closed) without strict workflow constraints.
- **FR-009**: System MUST validate that Title, Description, Priority, and Person responsible are provided before saving a new request.
- **FR-010**: System MUST restrict 'Requester' users from viewing the general request list or editing any requests, but MUST allow them to view a read-only list of requests they have personally created.

### Key Entities

- **Service Request**: Represents a task, issue, or job. Key attributes: Title, Description, Priority, Status, Creator ID (Reference to User), Assignee ID (Reference to User), Created At (Date and time of opening).
- **User**: Represents a person in the system. Key attributes: ID, Name, Role (Requester or Handler).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can successfully fill out and submit a new service request form in under 1 minute.
- **SC-002**: 100% of newly created requests accurately record the creation timestamp without user intervention.
- **SC-003**: Users can successfully update the status of a request, and see the change reflected on the list view immediately.

## Assumptions

- Users are authenticated and their role (Requester or Handler) is established before they interact with the request features.
- "Date and time of opening" is generated by the system backend, not selected manually by the user.
