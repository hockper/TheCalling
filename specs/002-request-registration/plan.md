# Implementation Plan: Request Registration

**Branch**: `001-project-base-setup` | **Date**: 2026-06-06 | **Spec**: [spec.md](file:///home/hockper/Documents/TheCalling/specs/002-request-registration/spec.md)

**Input**: Feature specification from `/specs/002-request-registration/spec.md`

## Summary

Implement the Request Registration feature, enabling Requesters to create and view their service requests, and Handlers to view and edit all requests. We will build a Go backend following Clean Architecture principles, exposing OpenAPI-documented REST endpoints, and a Next.js frontend with role-specific views.

## Technical Context

**Language/Version**: Go 1.22+ (Backend), TypeScript 5+ (Frontend)

**Primary Dependencies**: Next.js (App Router), OpenAPI (oapi-codegen), pgx (PostgreSQL driver)

**Storage**: PostgreSQL (Primary data store for Service Requests and Users), Redis (Caching - N/A for MVP of this specific feature)

**Testing**: Go testing package (unit/integration), Jest/Playwright (frontend)

**Target Platform**: Docker containers behind Traefik reverse proxy

**Project Type**: Web Application

**Performance Goals**: <200ms API response time for paginated lists

**Constraints**: Strict network isolation (database not exposed to host), environment-variable-based configuration

**Scale/Scope**: MVP scale.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I (Clean Architecture)**: The backend will strictly separate Domain, Usecase, and Delivery layers. (PASS)
- **Principle II (Design First API)**: OpenAPI schema will be created before writing Go handlers. (PASS)
- **Principle III (Infrastructure Isolation)**: All services run inside the Docker network. Backend connects to internal DB alias. (PASS)
- **Principle V (Security - No Hardcoded Secrets)**: Configuration via `.env` file. (PASS)

## Project Structure

### Documentation (this feature)

```text
specs/002-request-registration/
├── plan.md              
├── research.md          
├── data-model.md        
├── quickstart.md        
├── contracts/           
│   └── request_api.yaml
└── tasks.md             
```

### Source Code (repository root)

```text
backend/
├── cmd/
│   └── api/
├── internal/
│   ├── domain/
│   ├── request/
│   │   ├── delivery/
│   │   ├── repository/
│   │   └── usecase/
│   └── middleware/
├── docs/
│   └── openapi/
└── tests/

frontend/
├── src/
│   ├── app/
│   │   ├── (requester)/
│   │   └── (handler)/
│   ├── components/
│   └── lib/
│       └── api/
└── tests/
```

**Structure Decision**: Selected Web Application architecture adjusted to match the Go Clean Architecture layout defined in the base project setup.
