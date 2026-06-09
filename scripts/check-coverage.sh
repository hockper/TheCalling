#!/bin/bash
set -e

echo "=== Code Coverage Checker ==="

# 1. Check Backend Coverage
BACKEND_COVER_FILE="backend/coverage.out"
if [ ! -f "$BACKEND_COVER_FILE" ]; then
  echo "Error: Backend coverage file $BACKEND_COVER_FILE not found! Run backend tests first."
  exit 1
fi

BACKEND_PCT=$(docker run --rm -v "$(pwd)/backend:/app" -w /app golang:1.21-alpine go tool cover -func=coverage.out | grep total | grep -oE '[0-9]+\.[0-9]+' | head -n 1)
if [ -z "$BACKEND_PCT" ]; then
  echo "Error: Could not parse Go backend coverage percentage."
  exit 1
fi

echo "Go Backend Line Coverage: $BACKEND_PCT%"

# 2. Check Frontend Coverage
FRONTEND_COVER_FILE="frontend/coverage/coverage-summary.json"
if [ ! -f "$FRONTEND_COVER_FILE" ]; then
  echo "Error: Frontend coverage file $FRONTEND_COVER_FILE not found! Run frontend tests first."
  exit 1
fi

FRONTEND_PCT=$(node -e "try { console.log(require('./$FRONTEND_COVER_FILE').total.lines.pct); } catch(e) { process.exit(1); }")
if [ -z "$FRONTEND_PCT" ] || [ "$FRONTEND_PCT" = "undefined" ]; then
  echo "Error: Could not parse Vitest frontend coverage percentage."
  exit 1
fi

echo "Vitest Frontend Line Coverage: $FRONTEND_PCT%"

# 3. Enforce 80% Threshold
THRESHOLD=80.0

BACKEND_PASS=$(awk -v cov="$BACKEND_PCT" -v thresh="$THRESHOLD" 'BEGIN { if (cov >= thresh) print "1"; else print "0" }')
FRONTEND_PASS=$(awk -v cov="$FRONTEND_PCT" -v thresh="$THRESHOLD" 'BEGIN { if (cov >= thresh) print "1"; else print "0" }')

FAILED=0

if [ "$BACKEND_PASS" -eq 0 ]; then
  echo "❌ FAIL: Backend coverage $BACKEND_PCT% is below target $THRESHOLD%"
  FAILED=1
else
  echo "✅ PASS: Backend coverage meets target."
fi

if [ "$FRONTEND_PASS" -eq 0 ]; then
  echo "❌ FAIL: Frontend coverage $FRONTEND_PCT% is below target $THRESHOLD%"
  FAILED=1
else
  echo "✅ PASS: Frontend coverage meets target."
fi

if [ "$FAILED" -eq 1 ]; then
  exit 1
fi

echo "🎉 Success: All suites meet the 80% code coverage threshold!"
exit 0
