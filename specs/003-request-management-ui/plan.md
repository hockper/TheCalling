# Implementation Plan: Request Management UI

**Branch**: `003-request-management-ui` | **Date**: 2026-06-07 | **Spec**: [specs/003-request-management-ui/spec.md](file:///home/hockper/Documents/TheCalling/specs/003-request-management-ui/spec.md)

**Input**: Feature specification from `/specs/003-request-management-ui/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Frontend application for Requesters and Handlers to create, view, and manage service requests. It relies on Next.js 14, fetching data from the backend APIs using an Orval-generated client. Requires adding a `GET /api/users` endpoint to the backend contract for dynamic assignee population.

## Technical Context

**Language/Version**: TypeScript 5.3, React 18, Go (for backend addition)

**Primary Dependencies**: Next.js 14, Axios, Orval (API client generation), Vanilla CSS (or preferred styling framework)

**Storage**: N/A (Frontend), PostgreSQL (Backend)

**Testing**: React Testing Library / Jest (needs setup if missing)

**Target Platform**: Web browsers

**Project Type**: Web Application (Frontend) + Backend API addition

**Performance Goals**: Fast loading (<2s login), smooth transitions, responsive UX

**Constraints**: Must use HttpOnly cookies for Auth. Next.js App Router paradigm.

**Scale/Scope**: Supports distinct Requester and Handler views, forms, and data tables.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Modular Monolith & Clean Architecture**: Backend additions (`GET /api/users`) must follow existing Clean Architecture.
- **II. API Design-First & Automation**: Must update `openapi.yaml` with `GET /api/users` and run `orval` to generate the frontend client.
- **III. Type Safety & Componentization**: Strict TypeScript types in Next.js, reusable UI components for forms and tables.
- **IV. DevSecOps**: JWT HttpOnly cookies handled securely (with credentials true in Axios). No local storage for tokens.
- **V. Local Execution**: Fully supported via existing Docker Compose.
- **VI. Secret Management**: UI config via `.env`.

## Project Structure

### Documentation (this feature)

```text
specs/003-request-management-ui/
├── plan.md              
├── spec.md              
└── data-model.md
```

### Source Code (repository root)

```text
backend/
├── internal/
│   ├── core/domain/     # Any User list related updates
│   ├── adapter/api/     # GET /api/users handler
│   └── ...

frontend/
├── src/
│   ├── app/
│   │   ├── dashboard/       # Handler Queue Dashboard
│   │   ├── my-requests/     # Requester Personal Request List
│   │   ├── requests/new/    # Request creation form
│   │   └── requests/[id]/   # Request detail/editor
│   ├── components/
│   │   ├── RequestForm.tsx
│   │   └── RequestList.tsx
│   └── services/
│       └── api/             # Orval generated client
```

**Structure Decision**: Web application and API option. The UI is built entirely in the `frontend` folder using Next.js App Router, while the backend is slightly extended to fulfill `GET /api/users` using the existing Clean Architecture setup.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None      | N/A        | N/A                                 |
