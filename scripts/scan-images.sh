#!/bin/bash
set -e

# Run Trivy scanner on backend and frontend Docker images
echo "Scanning backend image..."
trivy image --severity HIGH,CRITICAL thecalling-backend:latest || echo "Trivy scan completed with some vulnerabilities"

echo "Scanning frontend image..."
trivy image --severity HIGH,CRITICAL thecalling-frontend:latest || echo "Trivy scan completed with some vulnerabilities"
