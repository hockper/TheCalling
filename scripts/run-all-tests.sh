#!/bin/bash
set -e

echo "=========================================================="
echo "          THE CALLING: AUTOMATED TEST SUITE RUNNER       "
echo "=========================================================="

# Create log/report directory
mkdir -p reports

echo ""
echo "----------------------------------------------------------"
echo "1. Running Go Backend Unit & Integration Tests..."
echo "----------------------------------------------------------"
docker run --rm -v "$(pwd)/backend:/app" -v /var/run/docker.sock:/var/run/docker.sock -v go-build-cache:/root/.cache/go-build -v go-pkg-mod-cache:/go/pkg -w /app golang:1.26-alpine go test -v -coverprofile=coverage.out -coverpkg=./internal/... ./internal/... ./tests/integration/...

echo ""
echo "----------------------------------------------------------"
echo "2. Running Next.js Frontend Unit & Component Tests..."
echo "----------------------------------------------------------"
docker run --rm -v "$(pwd)/frontend:/app" -w /app --user 1000:1000 node:20-alpine npx vitest run --coverage

echo ""
echo "----------------------------------------------------------"
echo "3. Running Playwright E2E Tests (Browser Automation)..."
echo "----------------------------------------------------------"
docker run --rm -v "$(pwd)/frontend:/app" -w /app mcr.microsoft.com/playwright:v1.60.0-jammy npx playwright test

echo ""
echo "----------------------------------------------------------"
echo "4. Running Static Analysis & Container Scans..."
echo "----------------------------------------------------------"
# Run ESLint check
docker run --rm -v "$(pwd)/frontend:/app" -w /app --user 1000:1000 node:20-alpine npm run lint

# Run Backend golangci-lint linter
echo "Running Go Backend Linter (golangci-lint)..."
docker run --rm -v "$(pwd)/backend:/app" -v golangci-lint-cache:/root/.cache -v go-pkg-mod-cache:/go/pkg -w /app golangci/golangci-lint:v1.64.8 golangci-lint run --timeout 10m

# Run Go Security Scan (gosec)
echo "Running Go Security Scan (gosec)..."
docker run --rm -v "$(pwd)/backend:/app" -v gosec-cache:/root/.cache -v go-pkg-mod-cache:/go/pkg -w /app securego/gosec:latest ./...

# Run Image scans
./scripts/scan-images.sh

echo ""
echo "----------------------------------------------------------"
echo "5. Verifying Code Coverage Threshold (80%)..."
echo "----------------------------------------------------------"
./scripts/check-coverage.sh

echo ""
echo "=========================================================="
echo "🎉 SUCCESS: All test suites completed and passed!"
echo "=========================================================="
exit 0
