# Data Model: Automatic Distribution and Kanban Dashboard

## Entities

### `Request` (or `Call`)
- **Description**: The core ticket or call to be handled.
- **Fields**:
  - `id` (UUID): Primary Key.
  - `title` (String): Short description.
  - `description` (Text): Detailed request info.
  - `status` (Enum/String): Current status (e.g., 'Open', 'In Progress', 'Closed').
  - `assignee_id` (UUID, Nullable): Foreign key to the User handling the request.
  - `created_at` (Timestamp): Creation time.
  - `updated_at` (Timestamp): Last update time.
- **Relationships**:
  - Belongs to `User` (as `assignee`).
- **Validation**:
  - `status` must be a valid Kanban column status.
- **State Transitions**:
  - Open -> In Progress
  - In Progress -> Closed

### `User` (Handler)
- **Description**: The person resolving requests.
- **Fields**:
  - `id` (UUID): Primary Key.
  - `name` (String): Handler's name.
  - `email` (String): Handler's email.
  - `is_active` (Boolean): Indicates if the handler is eligible for assignment.
- **Relationships**:
  - Has many `Requests`.

## Workload Calculation Query (Conceptual)
```sql
SELECT u.id
FROM users u
LEFT JOIN requests r ON u.id = r.assignee_id AND r.status NOT IN ('Closed')
WHERE u.is_active = true
GROUP BY u.id
ORDER BY COUNT(r.id) ASC, u.id ASC
LIMIT 1;
```
