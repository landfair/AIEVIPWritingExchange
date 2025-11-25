# Data Migration Guide

This guide will help you migrate all research entries from the HTML file to Firestore.

## Step 1: Generate Firebase Service Account Key

You need a service account key to run the migration script with admin privileges.

1. Go to [Firebase Console](https://console.firebase.google.com/project/saymorehere/settings/serviceaccounts)
2. Click on **"Service accounts"** tab
3. Click **"Generate new private key"**
4. Click **"Generate key"** in the confirmation dialog
5. A JSON file will download (e.g., `saymorehere-firebase-adminsdk-xxxxx.json`)

## Step 2: Save the Service Account Key

1. Rename the downloaded file to `serviceAccountKey.json`
2. Move it to `/Users/alexanderlandfair/Desktop/Projects/AIEFirebase/functions/`

**IMPORTANT:** Never commit this file to git! It's already in `.gitignore`.

## Step 3: Run the Migration Script

Once you've saved the service account key:

```bash
cd /Users/alexanderlandfair/Desktop/Projects/AIEFirebase/functions
node migrate-data.js
```

The script will:
- Extract all bibliography entries from the HTML
- Parse citation information, annotations, authors, and tags
- Organize entries by topic and subtopic
- Upload everything to Firestore in batches
- Extract and upload team member contribution data

## What Gets Migrated

### Research Entries Collection (`research_entries`)
Each entry contains:
- `id` - Unique identifier (slug from title)
- `sourceUrl` - Link to the original source
- `sourceTitle` - Title of the source
- `citation` - Full citation text
- `annotation` - Description/summary text
- `author` - Team member who added it
- `dateAdded` - Date the entry was added
- `tags` - Array of tags (e.g., ["general", "psychology"])
- `context` - Topic/subtopic context (e.g., "Understanding Users")
- `topicId` - Main topic identifier
- `subtopicId` - Subtopic identifier (if applicable)
- `category` - Full category path
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

### Team Members Collection (`team_members`)
Each member contains:
- `name` - Full name
- `contributions` - Number of entries contributed
- `entries` - Array of entry details
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

## Expected Output

You should see output like:

```
Starting migration...

Found 127 bibliography entries

Processed 127 entries

Sample entry:
{
  "id": "rise-of-machine-agency-a-framework-for-studying-the-psychology-of-human-ai-interaction-haii",
  "sourceUrl": "https://doi.org/10.1093/jcmc/zmz026",
  "sourceTitle": "Rise of Machine Agency: A Framework for Studying...",
  "citation": "Sundar, S. S. ...",
  "annotation": "This paper is useful for framing...",
  "author": "Alexander Landfair",
  "dateAdded": "12/2/2024",
  "tags": ["general", "psychology", "human-AI-interaction"],
  ...
}

Uploaded batch: 127/127 entries

✅ Migration complete!
Total entries migrated: 127

Extracting team member data...

Found 12 team members

✅ Team members migrated successfully!

🎉 All data migrated successfully!
```

## Verification

After migration, verify the data in Firestore:

1. Go to [Firestore Console](https://console.firebase.google.com/project/saymorehere/firestore)
2. Check the `research_entries` collection
3. Check the `team_members` collection
4. Verify a few entries have correct data

## Troubleshooting

### Error: "Cannot find module './serviceAccountKey.json'"
- Make sure you've downloaded and saved the service account key to the `functions` folder
- Check the filename is exactly `serviceAccountKey.json`

### Error: "ENOENT: no such file or directory"
- Make sure you're running the script from the `functions` directory
- Verify the path to `index.html` is correct

### Permission Errors
- The service account has full admin access by default
- If you get permission errors, check the Firebase Console for any restrictions

## Next Steps

After successful migration:
1. ✅ Data is in Firestore
2. ⏳ Update frontend to read from Firestore (Step 4)
3. ⏳ Convert backend to Cloud Functions (Step 4)
4. ⏳ Deploy to Firebase Hosting (Step 5)

## Safety Note

This migration script **does not** delete or modify the original HTML file. Your data remains safe in both places until you're ready to remove it from the HTML.

You can run the migration multiple times - it will overwrite existing entries with the same ID.
