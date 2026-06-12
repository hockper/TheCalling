# Data Model: Search and Filter Handlers

## Entities
No new database tables are introduced. We are extending the query capabilities of existing entities.

### ListRequestsFilter (Backend Domain Struct)
- `Search` (string): Text query to match against `Title` and `Description`.
- `CreatorIDs` ([]string): Array of user IDs to filter by requesters. Replaces singular `CreatorID`.
- `Priorities` ([]string): Array of priority levels ("LOW", "MEDIUM", "HIGH", "CRITICAL") to filter by.
- `Scope` (string): Existing field (e.g., "ALL", "ASSIGNED_TO_ME").
- `Limit`, `Offset` (int): Existing pagination fields.

## State Transitions
- No changes to entity state transitions. Filters simply constrain the view of existing data.
