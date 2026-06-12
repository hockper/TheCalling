# Feature Specification: Search and Filter Handlers

**Feature Branch**: `006-search-handlers`

**Created**: 2026-06-11

**Status**: Draft

**Input**: User description: "Search bar for Handlers - Primary Search Input (text): A single text box with placeholder text like \"Search requests...\". Under the hood, this single string is used to query both the title and description fields. Requester Filter (requesterName): A searchable dropdown (ComboBox or Select) populated with a list of users, allowing the user to select one or multiple requesters. Priority Filter (priority): A multi-select dropdown or a row of toggleable chips (e.g., High, Medium, Low, Critical) so users can view multiple priority levels at once. A note on the text search: It is highly recommended to implement a debounce (e.g., 300-500ms delay) on the text input if you plan to trigger the search automatically as the user types, rather than waiting for them to click a \"Filter\" button. This prevents spamming your backend with API calls for every keystroke. Implement the testing."

## Clarifications

### Session 2026-06-11
- Q: For the text search on title and description, should we use basic substring matching (e.g., SQL ILIKE) or advanced full-text search? → A: Basic substring matching (SQL ILIKE).
- Q: Should the Requester dropdown be populated with ALL system users, or ONLY users who have actually created at least one request? → A: All system users.
- Q: When a user applies a new filter while paginated, should the pagination reset to page 1? → A: Reset to page 1.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Text Search with Debounce (Priority: P1)

As a Handler, I want to type keywords into a primary search input so that I can quickly find specific service requests by their title or description.

**Why this priority**: Text search is the most universal and frequently used method to locate specific items within the global queue.

**Independent Test**: Can be tested by typing a keyword into the search bar, observing a delay (debounce effect), and seeing the request list update to show only requests containing that keyword in their title or description.

**Acceptance Scenarios**:

1. **Given** a populated list of service requests, **When** I type "login issue" into the search bar and pause, **Then** the list automatically updates after a brief delay to show only matching requests.
2. **Given** I am typing rapidly, **When** I type multiple characters continuously, **Then** no search is triggered until I stop typing for a defined duration (debounce).

---

### User Story 2 - Filter by Requester (Priority: P2)

As a Handler, I want to filter the request queue by selecting one or multiple Requesters from a dropdown so that I can focus on issues raised by specific users or departments.

**Why this priority**: Helps in managing escalations or requests from VIP users.

**Independent Test**: Can be tested by opening the Requester dropdown, searching for a user, selecting them, and verifying the displayed requests belong only to that creator.

**Acceptance Scenarios**:

1. **Given** the Handler dashboard, **When** I select one or multiple users from the Requester filter, **Then** the request list immediately updates to display only requests from those users.

---

### User Story 3 - Filter by Priority (Priority: P2)

As a Handler, I want to filter requests by priority using multi-select chips so that I can prioritize urgent issues first.

**Why this priority**: Critical for SLA management and incident triage.

**Independent Test**: Select "High" priority and verify the queue only shows high-priority requests.

**Acceptance Scenarios**:

1. **Given** a list of mixed-priority requests, **When** I toggle the "High" priority filter, **Then** the list updates to exclude all low and medium priority requests.

### Edge Cases

- **No Results Found**: A user enters a highly specific text search combined with strict priority filters resulting in 0 matches. The system must display a clear "No requests found matching your filters" message and an option to clear all active filters.
- **Backend Timeout**: A complex search query takes too long to resolve. The system must handle the timeout gracefully, showing an error state and allowing the user to retry the search.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a text input field on the Handler Dashboard with the placeholder "Search requests...".
- **FR-002**: System MUST debounce the text input (300-500ms delay) before applying the search filter to avoid excessive processing and API calls.
- **FR-003**: The text search MUST query against both the `title` and `description` of the requests using basic substring matching (case-insensitive, e.g., SQL ILIKE).
- **FR-004**: System MUST provide a searchable multi-select dropdown for filtering by Requester, populated with all system users.
- **FR-005**: System MUST provide a multi-select priority filter (toggleable chips or dropdown) allowing selection of one or multiple priority levels (Low, Medium, High).
- **FR-006**: System MUST combine all active filters (text, requester, priority) using AND logic.
- **FR-007**: System MUST preserve active filters when paginating through results.
- **FR-008**: System MUST reset pagination to page 1 whenever any filter is applied or changed.
- **FR-009**: System MUST include comprehensive automated tests covering the frontend debounce/filter UI and backend query logic.

### Key Entities

- **Service Request**: Needs to be queried efficiently based on text matching on Title/Description and filtering by Creator/Priority.
- **User**: Serves as the list of available Requesters in the filter dropdown.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Handlers can locate a specific request using a combination of filters in under 5 seconds.
- **SC-002**: Typing rapidly in the text search triggers only 1 API call after the user stops typing (debounce validation).
- **SC-003**: The system correctly filters the request list with 100% accuracy when combining Text, Requester, and Priority filters.
- **SC-004**: Test coverage for the search and filtering components (both frontend and backend) is implemented successfully.

## Assumptions

- The backend API (`GET /api/requests`) will need to be updated to support the new query parameters (`search`, `requesters`, `priorities`).
- The existing OpenAPI contract will be updated to reflect the new search/filter parameters.
- Requesters dropdown can be populated using the existing `GET /api/users` endpoint without needing to aggregate actual request creators.
