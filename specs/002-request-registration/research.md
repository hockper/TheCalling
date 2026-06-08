# Research & Decisions: Request Registration

## Decision: Pagination Approach for Request List
- **Decision**: Offset-based pagination (`limit`, `offset`).
- **Rationale**: Offset-based is simpler to implement and adequate for MVP scale. If performance degrades with millions of records, we can migrate to cursor-based later.
- **Alternatives considered**: Cursor-based pagination (more complex to implement and query, requires monotonic ordering field).

## Decision: Role-Based Access Control Implementation
- **Decision**: Implement authentication/authorization middleware in the Go backend that injects the user's Role (`Requester` or `Handler`) into the request context. 
- **Rationale**: Keeps business logic decoupled from HTTP transport.
- **Alternatives considered**: Checking roles inside each usecase (violates separation of concerns slightly if it's purely an HTTP access issue).

## Decision: OpenAPI Definition Location
- **Decision**: Add a new `request_api.yaml` contract and merge it or reference it from the main OpenAPI spec.
- **Rationale**: Keeps API contract centralized, modular, and manageable.
