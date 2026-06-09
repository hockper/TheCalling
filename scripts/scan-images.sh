#!/bin/bash
set -e

# Run Trivy scanner on backend and frontend Docker images via Docker
echo "Scanning backend image..."
docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v ~/.cache:/root/.cache \
  aquasec/trivy:latest image \
  --format table \
  --exit-code 1 \
  --ignore-unfixed \
  --vuln-type os,library \
  --severity CRITICAL,HIGH \
  thecalling-backend:latest

echo "Scanning frontend image..."
docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v ~/.cache:/root/.cache \
  aquasec/trivy:latest image \
  --format table \
  --exit-code 1 \
  --ignore-unfixed \
  --vuln-type os,library \
  --severity CRITICAL,HIGH \
  thecalling-frontend:latest
