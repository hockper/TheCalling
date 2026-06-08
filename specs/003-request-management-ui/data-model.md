# Data Model & Contracts: Request Management UI

## OpenAPI Additions

To fulfill FR-009, we must add a `GET /api/users` endpoint.

```yaml
  /api/users:
    get:
      summary: List users
      description: Returns a list of users, primarily used to populate assignee dropdowns.
      operationId: listUsers
      security:
        - CookieAuth: []
      parameters:
        - in: query
          name: role
          schema:
            type: string
            enum: [requester, handler]
          description: Optional filter by user role.
      responses:
        '200':
          description: A list of users.
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'
        '401':
          description: Not authenticated.
```

## Frontend Components State

### `RequestForm`
State:
- `title` (string)
- `description` (string)
- `priority` (enum: low, medium, high)
- `assignee_id` (uuid)
Props:
- `initialData` (optional, for editing)
- `onSubmit` (function)

### `RequestList`
State:
- `page` (number)
- `requests` (Array<ServiceRequest>)
- `total` (number)
Props:
- `roleContext` ("requester" | "handler")

## Route Protections
Next.js Middleware or Higher-Order Components will intercept routes based on the current user's role:
- `/dashboard` -> requires `handler`
- `/requests/[id]` -> requires `handler`
- `/my-requests` -> requires `requester`
- `/requests/new` -> requires `requester`
