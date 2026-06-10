# Testing Data Models & Metrics

While testing is largely an operational and procedural capability, the automated reporting aspects define a few key entities used to evaluate success criteria.

## Core Entities

### Test Suite
A collection of related test cases grouped by module, layer, or user story.

**Attributes:**
- `Name`: String (e.g., "Backend Unit Tests")
- `Type`: Enum (Unit, Integration, E2E, Security, Performance)
- `CoveragePercentage`: Float (0.0 - 100.0)
- `PassRate`: Float (0.0 - 100.0)

### Test Report
An automatically generated document summarizing test execution results.

**Attributes:**
- `TotalTests`: Integer
- `Passed`: Integer
- `Failed`: Integer
- `Skipped`: Integer
- `CoveragePercentage`: Float
- `Duration`: Float (in seconds)
- `Timestamp`: DateTime

### Coverage Target
A threshold that must be met for the test suite to be considered passing.

**Attributes:**
- `TargetLineCoverage`: Float (80.0)
- `TargetBranchCoverage`: Float (80.0)

## Performance Metrics

### API Endpoint Benchmark
A measurement of system performance under load.

**Attributes:**
- `Endpoint`: String
- `ConcurrentUsers`: Integer (e.g., 100)
- `P95ResponseTime`: Integer (in milliseconds, target < 500)
- `ErrorRate`: Float (target < 1.0%)

## Exclusions
Auto-generated Orval API clients (`frontend/src/services/api/client.ts`, `frontend/src/services/api/model/`) are explicitly excluded from coverage calculations.
