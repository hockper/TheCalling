# Research: Search and Filter Handlers

## Search Implementation
- **Decision**: Use `ILIKE` for case-insensitive substring matching on `title` and `description` fields.
- **Rationale**: Based on user clarification, basic substring matching is sufficient and avoids the complexity of configuring full-text search (tsvector).
- **Alternatives considered**: PostgreSQL full-text search (tsvector/tsquery), Elasticsearch. Rejected due to current scale requirements and simplicity preference.

## Requester Dropdown Population
- **Decision**: Populate dropdown with all system users.
- **Rationale**: Based on user clarification, this is simpler, uses existing endpoints (`GET /api/users`), and allows searching for users without active requests.
- **Alternatives considered**: Aggregating distinct creators from the `requests` table.

## Frontend Debouncing
- **Decision**: Implement a custom React hook (e.g., `useDebounce`) or use `lodash.debounce` for 300-500ms delay on the text input.
- **Rationale**: Prevents API spamming while typing.

## Pagination Reset
- **Decision**: Reset React state `page` to 1 whenever any filter dependency changes.
- **Rationale**: Standard UX practice to avoid empty states when filter narrows result set.
