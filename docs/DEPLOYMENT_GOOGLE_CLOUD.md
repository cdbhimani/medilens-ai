# Google Cloud & Firebase Deployment Guide

This guide details how to deploy MediLens AI to production using **Google Cloud Run** for the backend and **Firebase Hosting** for the frontend.

---

## 1. Prerequisites & GCP Project Setup

1. **Install Google Cloud SDK (`gcloud`) and Firebase CLI**:
   ```bash
   gcloud auth login
   npm install -g firebase-tools
   firebase login
   ```

2. **Set your Google Cloud Project**:
   ```bash
   gcloud config set project YOUR_PROJECT_ID
   ```

3. **Enable Required Google Cloud APIs**:
   ```bash
   gcloud services enable \
     run.googleapis.com \
     artifactregistry.googleapis.com \
     secretmanager.googleapis.com \
     firestore.googleapis.com \
     cloudbuild.googleapis.com
   ```

---

## 2. Secrets Management with Google Cloud Secret Manager

Store your Gemini API Key securely in Secret Manager so it is never committed or exposed:

```bash
# 1. Create the secret
echo -n "YOUR_ACTUAL_GEMINI_API_KEY" | gcloud secrets create GEMINI_API_KEY \
  --data-file=- \
  --replication-policy="automatic"

# 2. Grant Cloud Run Service Account access to the secret
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format='value(projectNumber)')
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 3. Deploying the Backend to Google Cloud Run

1. **Build and Deploy using Google Cloud Build & Cloud Run**:
   ```bash
   cd backend

   # Build container image in Google Artifact Registry
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/medilens-ai-backend

   # Deploy container to Cloud Run
   gcloud run deploy medilens-ai-backend \
     --image gcr.io/YOUR_PROJECT_ID/medilens-ai-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-secrets=GEMINI_API_KEY=GEMINI_API_KEY:latest \
     --set-env-vars=NODE_ENV=production,PORT=8080 \
     --memory 1Gi \
     --cpu 1 \
     --min-instances 0 \
     --max-instances 10
   ```

2. Note the deployed backend Service URL (e.g., `https://medilens-ai-backend-xxxxx-uc.a.run.app`).

---

## 4. Deploying the Frontend to Firebase Hosting

1. **Configure API Proxy in `firebase/firebase.json`**:
   Update `firebase/firebase.json` with your Cloud Run service name (`medilens-ai-backend`) or destination URL.

2. **Build the Frontend**:
   ```bash
   cd frontend
   npm run build
   ```

3. **Deploy to Firebase Hosting and apply Firestore Rules**:
   ```bash
   cd firebase
   firebase use YOUR_PROJECT_ID
   firebase deploy --only hosting,firestore:rules,storage:rules
   ```

Your application is now live at `https://YOUR_PROJECT_ID.web.app`!

---

## 5. Security Rules Verification

- Verify that `firebase/firestore.rules` enforces `request.auth.uid == resource.data.userId`.
- Verify that `firebase/storage.rules` restricts file uploads to `15MB` and authorized image/PDF types.
- Verify health check: `curl https://YOUR_SERVICE_URL/health`
