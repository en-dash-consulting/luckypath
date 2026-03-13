#!/usr/bin/env bash
#
# deploy.sh — Build and deploy Lucky Path to Google Cloud Run.
#
# Prerequisites:
#   - gcloud CLI installed and authenticated (`gcloud auth login`)
#   - Docker daemon running (Cloud Run source deploy builds a container)
#   - Sufficient IAM permissions on the the target GCP project
#     (roles/run.admin, roles/iam.serviceAccountUser)
#
# Usage:
#   ./deploy.sh
#
# This script builds the app from source using the project Dockerfile,
# pushes the image to Artifact Registry, and deploys it as a Cloud Run
# service. No arguments are required — project, region, and resource
# limits are configured below.
#
set -euo pipefail

PROJECT_ID="${GCP_PROJECT_ID:?Set GCP_PROJECT_ID env var}"
SERVICE_NAME="luckypath"
REGION="us-central1"

echo "Building and deploying to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --project "$GCP_PROJECT_ID" \
  --region "$REGION" \
  --source . \
  --allow-unauthenticated \
  --port 8080 \
  --memory 256Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 3

echo "Done! Service URL:"
gcloud run services describe "$SERVICE_NAME" \
  --project "$GCP_PROJECT_ID" \
  --region "$REGION" \
  --format 'value(status.url)'
