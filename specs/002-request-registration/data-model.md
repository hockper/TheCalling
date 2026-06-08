# Data Model: Request Registration

## Entities

### User
*Represents a person in the system.*
- `id` (UUID): Primary Key
- `name` (String): Full name of the user
- `role` (Enum): `Requester` | `Handler`

### Service Request
*Represents a task, issue, or job.*
- `id` (UUID): Primary Key
- `title` (String): Brief summary (Required)
- `description` (Text): Detailed description (Required)
- `priority` (Enum): `low` | `medium` | `high` (Required)
- `status` (Enum): `open` | `in_progress` | `resolved` | `closed` (Required, default: `open`)
- `creator_id` (UUID): Reference to User (Required). The Requester who created it.
- `assignee_id` (UUID): Reference to User. The Handler assigned to the work.
- `created_at` (Timestamp): Date and time of opening (Required, auto-generated)
- `updated_at` (Timestamp): For tracking changes.

## Relationships
- A `User` (Creator) can create multiple `Service Requests` (1:N).
- A `User` (Assignee) can be assigned to multiple `Service Requests` (1:N).
- A `Service Request` belongs to exactly one Creator and optionally one Assignee.

## State Transitions
- **Status**: Free transitions allowed between `open`, `in_progress`, `resolved`, `closed`.
