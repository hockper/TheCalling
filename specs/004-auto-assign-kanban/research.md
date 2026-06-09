# Phase 0: Research & Technical Decisions

## Unknown 1: Live updates for the Kanban Dashboard
- **Decision**: Simple HTTP Polling via React SWR / React Query.
- **Rationale**: The specification requires UI updates within 1 second for view toggling, but does not strictly mandate instantaneous push notifications from the server when other handlers change states. Implementing WebSockets or SSE adds unnecessary infrastructure complexity at this stage. SWR polling combined with optimistic UI updates for local actions is sufficient to meet the `< 1 second` responsiveness criteria while maintaining a simple stateless backend.
- **Alternatives considered**: WebSockets (rejected due to added stateful connection management), Server-Sent Events (SSE) (rejected as overkill for current requirements).

## Unknown 2: Workload Calculation for Auto-Assignment
- **Decision**: PostgreSQL aggregate query at assignment time.
- **Rationale**: We can perform a query to count open requests grouped by handler and order by count ascending. Given the scale (rendering up to 500 tasks mentioned, meaning thousands of open tasks total), PostgreSQL can easily compute this grouping in milliseconds using an index on `(assignee_id, status)`. This avoids the cache invalidation complexities of maintaining workload counters in Redis.
- **Alternatives considered**: Redis counters (rejected because maintaining consistency between Postgres and Redis for request assignments is unnecessary overhead for this scale).

## Unknown 3: Tie-Breaking Mechanism
- **Decision**: Tie-breaker by `user_id` ascending.
- **Rationale**: The spec states "assigning to the first available handler alphabetically or by ID". Ordering by ID is the most efficient database operation since it's the primary key of the users table.
- **Alternatives considered**: Random assignment (rejected as it requires extra DB logic and hurts deterministic testing).
