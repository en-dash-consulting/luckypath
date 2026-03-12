#!/usr/bin/env bash
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
