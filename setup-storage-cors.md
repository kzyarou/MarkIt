# Firebase Storage CORS Setup

To fix the CORS issues with Firebase Storage, you need to configure CORS rules for your storage bucket.

## Method 1: Using Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `markit-e4ade`
3. Navigate to Cloud Storage > Buckets
4. Click on your bucket: `markit-e4ade.firebasestorage.app`
5. Go to the "Permissions" tab
6. Click "Add CORS configuration"
7. Use this configuration:

```json
[
  {
    "origin": ["http://localhost:5173", "https://yourdomain.com"],
    "method": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "maxAgeSeconds": 3600
  }
]
```

## Method 2: Using gsutil command

1. Install Google Cloud SDK
2. Run this command:

```bash
gsutil cors set cors.json gs://markit-e4ade.firebasestorage.app
```

## Method 3: Using Firebase CLI

```bash
firebase storage:rules:set
```

Then set these rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## After CORS is configured

Once CORS is properly configured, you can uncomment the Firebase Storage upload code in `CreateHarvest.tsx` and remove the local URL workaround.

The current implementation uses local blob URLs as a temporary solution to avoid CORS errors during development.



