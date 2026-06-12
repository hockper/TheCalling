# API Contract Changes

## Endpoint: `GET /api/requests`

### Query Parameters Added/Modified:
- `search` (string, optional): Keyword to search in title and description.
- `creator_id` (array of strings, optional): Replaces singular `creator_id` to allow filtering by multiple requesters. Format: `?creator_id=uuid1&creator_id=uuid2`.
- `priority` (array of strings, optional): Filter by multiple priorities. Format: `?priority=HIGH&priority=CRITICAL`.

### OpenAPI YAML Updates:
Need to update `openapi.yaml` under `/requests` GET method parameters to reflect array types for `creator_id` and `priority`, and add `search`.
