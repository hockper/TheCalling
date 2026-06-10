# Data Model & Configuration Schema: Project Base Setup

**Feature**: [spec.md](file:///home/hockper/Documents/TheCalling/specs/001-project-base-setup/spec.md)

This document outlines the core configuration structures, environment variables, and the relational schema metadata for the monorepo setup.

## 1. Environment Configurations

All service configurations must be injected via environment variables at runtime, adhering strictly to the security standards (no hardcoded secrets).

### Monorepo Stack Environment Schema

| Variable | Target Service | Type | Description / Example | Security Requirement |
|----------|----------------|------|-----------------------|----------------------|
| `PORT` | Backend | Integer | Port backend listens on (e.g., `8080`) | Non-Secret |
| `DATABASE_URL` | Backend | String | Connection URI: `postgres://user:pass@postgres:5432/dbname?sslmode=disable` | **Secret** (MUST be injected) |
| `REDIS_URL` | Backend | String | Connection URI: `redis://redis:6379/0` | **Secret** (MUST be injected) |
| `JWT_SECRET` | Backend | String | Random cryptographic key used for JWT signing | **Secret** (MUST be injected) |
| `ENV` | Backend | String | Runtime mode: `development`, `production`, `test` | Non-Secret |
| `NEXT_PUBLIC_API_URL` | Frontend | String | Gateway endpoint for frontend API calls (e.g., `/api`) | Non-Secret |

---

## 2. Database Migration Metadata Table

To support structural migrations under PostgreSQL, the migrations tool will manage a metadata schema table.

### Entity: `schema_migrations`
Tracks the execution of SQL migration scripts.

```sql
CREATE TABLE schema_migrations (
    version bigint PRIMARY KEY,
    dirty boolean NOT NULL
);
```

- **Fields**:
  - `version`: Timestamp/sequential number representing the schema revision.
  - `dirty`: Boolean flag indicating if the migration execution failed or succeeded.

---

## 3. Redis Key Structure
Redis is utilized for caching and async message queues.

### Health Check Key
- **Pattern**: `health:backend`
- **Type**: String
- **TTL**: 60 seconds
- **Purpose**: Verifies Redis read/write capabilities during service startup.
