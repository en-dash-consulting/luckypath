# Deploy Setup Guide

This project auto-deploys to Google Cloud Run on every push to `main` via GitHub Actions using Workload Identity Federation (no service account keys needed).

## Prerequisites

- [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) installed and authenticated
- A GitHub repository for this project
- GCP project (set via GCP_PROJECT_ID env var) already created

## 1. Enable required GCP APIs

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  iamcredentials.googleapis.com \
  --project $GCP_PROJECT_ID
```

## 2. Create a service account for deployments

```bash
gcloud iam service-accounts create github-deploy \
  --display-name="GitHub Actions Deploy" \
  --project $GCP_PROJECT_ID
```

Grant it the roles needed to deploy to Cloud Run:

```bash
SA_EMAIL="github-deploy@<GCP_PROJECT_ID>.iam.gserviceaccount.com"

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/cloudbuild.builds.builder"

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/iam.serviceAccountUser"
```

## 3. Set up Workload Identity Federation

Create the identity pool:

```bash
gcloud iam workload-identity-pools create "github" \
  --location="global" \
  --display-name="GitHub Actions" \
  --project $GCP_PROJECT_ID
```

Create the OIDC provider (replace `YOUR_GITHUB_ORG/YOUR_REPO` with your actual repo, e.g. `endash/luckypath`):

```bash
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --location="global" \
  --workload-identity-pool="github" \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --project $GCP_PROJECT_ID
```

Allow the GitHub repo to impersonate the service account (replace `YOUR_GITHUB_ORG/YOUR_REPO`):

```bash
gcloud iam service-accounts add-iam-policy-binding "$SA_EMAIL" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/$(gcloud projects describe $GCP_PROJECT_ID --format='value(projectNumber)')/locations/global/workloadIdentityPools/github/attribute.repository/YOUR_GITHUB_ORG/YOUR_REPO" \
  --project $GCP_PROJECT_ID
```

## 4. Get the WIF provider resource name

```bash
gcloud iam workload-identity-pools providers describe "github-provider" \
  --location="global" \
  --workload-identity-pool="github" \
  --project $GCP_PROJECT_ID \
  --format="value(name)"
```

This outputs something like:

```
projects/123456789/locations/global/workloadIdentityPools/github/providers/github-provider
```

## 5. Add GitHub repository secrets

Go to your repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret** and add:

| Secret Name | Value |
|---|---|
| `WIF_PROVIDER` | The full provider resource name from step 4 |
| `WIF_SERVICE_ACCOUNT` | `github-deploy@<GCP_PROJECT_ID>.iam.gserviceaccount.com` |

## 6. Push to main

That's it. Every push to `main` will now build and deploy to Cloud Run automatically. The service URL will be available at:

```bash
gcloud run services describe $SERVICE_NAME \
  --project $GCP_PROJECT_ID \
  --region us-central1 \
  --format 'value(status.url)'
```
