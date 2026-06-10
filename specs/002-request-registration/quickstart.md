# Quickstart: Request Registration

## 1. Running the System (Docker Compose)
All services (API Gateway, Go Backend, Next.js Frontend, PostgreSQL, Redis) are configured to run automatically with Docker Compose.
From the root directory:
```bash
docker-compose up --build
```
This command builds the images, starts the containers, and **automatically runs the database migrations and seeds on startup**.

## 2. Seeded Users for Testing
The database is seeded with two users for testing role-based access control (RBAC). Both users have the password **`password123`**:

| Email | Name | Role | Purpose / Access |
|---|---|---|---|
| **`requester@thecalling.com`** | Bob Requester | `requester` | Can create new requests, view list of own requests, and view own request details. |
| **`handler@thecalling.com`** | Alice Handler | `handler` | Can view a dashboard of all requests, view details of any request, edit requests, change status, and update assignees. |

## 3. Testing Workflow
1. Navigate to http://localhost (or the designated local port) to access the landing page.
2. Log in as **`requester@thecalling.com`**:
   - Go to **+ New Request** and submit a request. Keep note of the UUID used in **Assignee ID** (e.g. Alice Handler's ID: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`).
   - Verify it appears in your **My Requests** list.
   - Click to view details and check its status is `open`.
3. Sign Out and log in as **`handler@thecalling.com`**:
   - Verify you see the **Dashboard** listing all service requests.
   - Click on the request you created as Bob.
   - Click **Edit**, change the status to `in_progress` or `resolved`, and save.
   - Verify the status updates correctly on the dashboard.

