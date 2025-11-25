# Cloud Functions Setup Guide

This guide will help you set up and deploy the Firebase Cloud Functions that replace the Express.js server.

## What We've Created

The Cloud Functions include:
- **`chat`** - Handles AI chatbot requests using Claude API
- **`health`** - Health check endpoint
- **`api`** - Main API router (forwards requests to chat/health)

## Step 1: Set Up Anthropic API Key

You need to configure the Anthropic API key as a secret for Cloud Functions.

### Option A: Using Firebase Secret Manager (Recommended for Production)

```bash
cd /Users/alexanderlandfair/Desktop/Projects/AIEFirebase
firebase functions:secrets:set ANTHROPIC_API_KEY
```

When prompted, paste your Anthropic API key.

### Option B: Using .env File (For Local Testing Only)

1. Get your Anthropic API key from the original project or from https://console.anthropic.com/
2. Create a `.env` file in the functions directory:

```bash
cd /Users/alexanderlandfair/Desktop/Projects/AIEFirebase/functions
cat > .env << EOF
ANTHROPIC_API_KEY=your_actual_api_key_here
EOF
```

**IMPORTANT:** Never commit the `.env` file to git! It's already in `.gitignore`.

## Step 2: Test Locally with Firebase Emulators (Optional)

Before deploying, you can test locally:

```bash
cd /Users/alexanderlandfair/Desktop/Projects/AIEFirebase
firebase emulators:start
```

This will start:
- Functions Emulator: http://localhost:5001
- Firestore Emulator: http://localhost:8080
- Hosting Emulator: http://localhost:5000
- Emulator UI: http://localhost:4000

Test the chat endpoint:
```bash
curl -X POST http://localhost:5001/saymorehere/us-central1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello"}],
    "entries": [],
    "teamData": {}
  }'
```

## Step 3: Deploy Cloud Functions

Once you've tested locally (or if you want to deploy directly):

```bash
cd /Users/alexanderlandfair/Desktop/Projects/AIEFirebase
firebase deploy --only functions
```

This will:
- Build and package your functions
- Upload them to Firebase
- Configure the endpoints
- Return the URLs for your functions

**Note:** First deployment may take 3-5 minutes. You'll also need to upgrade to the Blaze (pay-as-you-go) plan if you haven't already.

### Expected Output

```
=== Deploying to 'saymorehere'...

i  deploying functions
i  functions: preparing functions directory for uploading...
✔  functions: functions folder uploaded successfully
i  functions: creating function chat...
i  functions: creating function health...
i  functions: creating function api...
✔  functions[chat(us-central1)]: Successful create operation.
✔  functions[health(us-central1)]: Successful create operation.
✔  functions[api(us-central1)]: Successful create operation.

✔  Deploy complete!

Functions:
  chat: https://us-central1-saymorehere.cloudfunctions.net/chat
  health: https://us-central1-saymorehere.cloudfunctions.net/health
  api: https://us-central1-saymorehere.cloudfunctions.net/api
```

## Step 4: Update Frontend to Use Cloud Functions

The frontend needs to be updated to call the Cloud Functions instead of the Express server.

In `chatbot.js`, change the API endpoint from:
```javascript
const response = await fetch('/api/chat', {
```

To:
```javascript
const response = await fetch('https://us-central1-saymorehere.cloudfunctions.net/api/chat', {
```

Or use the Firebase Functions SDK (which we'll do in the next step).

## Step 5: Verify Deployment

Test the health endpoint:
```bash
curl https://us-central1-saymorehere.cloudfunctions.net/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-11-25T...",
  "service": "AI Education VIP Research Exchange API"
}
```

## Upgrading to Blaze Plan

If you see an error about billing, you need to upgrade:

1. Go to https://console.firebase.google.com/project/saymorehere/overview
2. Click "Upgrade" in the left sidebar
3. Select "Blaze Plan" (pay-as-you-go)
4. Set up billing alerts (recommended):
   - Go to Google Cloud Console
   - Set budget alert at $10-20/month

**Don't worry:** Firebase has generous free tiers:
- 2 million function invocations per month (free)
- Cloud Functions are very cost-effective for this use case

## Monitoring and Logs

View function logs:
```bash
firebase functions:log
```

Or in the console:
https://console.firebase.google.com/project/saymorehere/functions/logs

## Troubleshooting

### Error: "Missing credentials"
- Make sure you've set the ANTHROPIC_API_KEY secret
- If using .env, make sure the file is in the `functions` directory

### Error: "Billing account not configured"
- Upgrade to the Blaze plan (see above)

### Error: "Function deployment failed"
- Check the logs: `firebase functions:log`
- Verify all dependencies are in `package.json`
- Make sure you're in the project root directory

### Functions are slow on first call
- Cloud Functions "cold start" can take 1-2 seconds
- After the first call, subsequent calls are fast
- Consider using Firebase Hosting rewrites to keep functions warm

## Cost Estimation

For a research team of ~20 users with moderate usage:
- **Estimated cost:** $0-5/month
- Cloud Functions free tier covers most academic use cases
- Firestore reads/writes are also very generous in free tier

## Next Steps

After deploying functions:
1. ✅ Cloud Functions deployed
2. ⏳ Update frontend to use Cloud Functions (Step 5)
3. ⏳ Deploy to Firebase Hosting (Step 6)
4. ⏳ Test end-to-end functionality (Step 7)
