# Quickstart: Automatic Distribution and Kanban Dashboard

## Local Environment Setup
To run the project with the new features:

1. **Start the Stack**:
   The `docker compose up` command will bring up the PostgreSQL database, Redis, and Next.js frontend, and Go backend.
   ```bash
   docker compose up -d
   ```

2. **Verify Database**:
   Ensure that the `requests` table has the necessary `assignee_id` field and `users` are properly populated. Run migrations if necessary:
   ```bash
   # example migration command
   go run cmd/migrate/main.go
   ```

3. **Run Backend (Go)**:
   ```bash
   cd backend
   go run main.go
   ```

4. **Run Frontend (Next.js)**:
   ```bash
   cd frontend
   npm run dev
   ```

## Using the Feature
- Navigate to the **Handler Dashboard**.
- Toggle between "My Requests" and "All Requests" using the UI toggle switch.
- Drag and drop request cards between columns (e.g., "Open" -> "In Progress") to trigger state updates.
- Create a new request via the UI or API and observe it automatically assigned to the active handler with the fewest open tasks.
