# Firebase Setup Guide for AI Education VIP Research Exchange

This guide will walk you through setting up Firebase for the project.

## Prerequisites

- [x] Node.js 18 or higher installed
- [x] Firebase CLI installed (`firebase --version` shows 14.0.1)
- [x] Firebase dependencies installed
- [x] Project structure created

## Step 1: Create Firebase Project (Manual Step Required)

You need to manually create a Firebase project in the Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" or "Create a project"
3. Enter project name: `ai-education-vip-research` (or your preferred name)
4. Enable Google Analytics (optional but recommended)
5. Click "Create project"

## Step 2: Connect Your Local Project to Firebase

Once your Firebase project is created:

```bash
cd /Users/alexanderlandfair/Desktop/Projects/AIEFirebase
firebase login
firebase use --add
```

Select your project from the list and give it an alias (e.g., `default`).

## Step 3: Enable Firebase Services

In the Firebase Console, enable the following services:

### 3.1 Authentication
1. Go to Authentication > Sign-in method
2. Enable "Google" provider
3. Add authorized domains:
   - `localhost` (for development)
   - Your production domain (when deployed)

### 3.2 Firestore Database
1. Go to Firestore Database
2. Click "Create database"
3. Start in **production mode** (we have security rules configured)
4. Choose your region (e.g., `us-central1`)

### 3.3 Cloud Functions
1. Cloud Functions will be automatically enabled when you deploy
2. You may need to upgrade to the Blaze (pay-as-you-go) plan
   - Don't worry: Firebase has a generous free tier
   - Set up billing alerts if concerned

## Step 4: Get Firebase Configuration

1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Web" (</>) to add a web app
4. Register app with nickname: "AI Education VIP Web"
5. Copy the `firebaseConfig` object

Update `/Users/alexanderlandfair/Desktop/Projects/AIEFirebase/AIEVIPWritingExchange/public/firebase-config.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef",
  measurementId: "G-XXXXXXXXXX"
};
```

## Step 5: Set Up Environment Variables

Create `.env` file in the functions directory:

```bash
cd functions
cat > .env << EOF
ANTHROPIC_API_KEY=your_anthropic_api_key_here
EOF
```

**Important:** Get your Anthropic API key from the original project's `.env` file or from your Anthropic Console.

## Step 6: Deploy Firestore Rules and Indexes

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

## Step 7: Test with Firebase Emulators (Optional but Recommended)

Before deploying to production, test locally:

```bash
firebase emulators:start
```

This will start:
- Hosting on http://localhost:5000
- Functions on http://localhost:5001
- Firestore on http://localhost:8080
- Emulator UI on http://localhost:4000

## Current Status

✅ Firebase configuration files created
✅ Firestore security rules configured
✅ Functions directory structure set up
✅ Package dependencies installed
✅ ESLint configuration added

## Next Steps

After completing the manual Firebase Console setup above:

1. ✅ Complete Step 1: Set up Firebase project and install dependencies
2. ⏳ Configure Firebase Authentication
3. ⏳ Migrate research entries to Firestore
4. ⏳ Convert Express backend to Cloud Functions
5. ⏳ Update frontend to use Firebase SDK
6. ⏳ Deploy to Firebase Hosting
7. ⏳ Configure security rules and test

## Files Created

- `/firebase.json` - Firebase project configuration
- `/firestore.rules` - Security rules for Firestore
- `/firestore.indexes.json` - Database indexes
- `/functions/package.json` - Cloud Functions dependencies
- `/functions/.eslintrc.js` - ESLint configuration
- `/functions/.gitignore` - Git ignore for functions
- `/AIEVIPWritingExchange/public/firebase-config.js` - Frontend Firebase config

## Troubleshooting

### Issue: "Firebase CLI not found"
```bash
npm install -g firebase-tools
```

### Issue: "Not authorized"
```bash
firebase logout
firebase login
```

### Issue: "Project not found"
Make sure you've created the project in Firebase Console and run `firebase use --add`.

## Need Help?

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com)
- [Anthropic Documentation](https://docs.anthropic.com)
