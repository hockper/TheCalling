# Quickstart: Handlers Search

## Local Development
1. Start the stack: `docker compose up`
2. Ensure backend is running and `GET /api/requests` supports new query parameters.
3. Start frontend with `npm run dev` in `frontend/`.
4. Navigate to `http://localhost:3000/handler/dashboard`.

## Testing
- Backend: Run `go test ./internal/request/...`
- Frontend: Run `npm run test` in the `frontend/` directory to verify debounce and filter state logic.
