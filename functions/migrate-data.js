// Migration script to extract research entries from HTML and upload to Firestore
// Run this script once to migrate all existing data to Firebase

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

// Initialize Firebase Admin
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Read the HTML file
const htmlPath = path.join(__dirname, "..", "AIEVIPWritingExchange", "public", "index.html");
const htmlContent = fs.readFileSync(htmlPath, "utf8");

// Parse HTML
const dom = new JSDOM(htmlContent);
const document = dom.window.document;

async function migrateEntries() {
  console.log("Starting migration...\n");

  const entries = [];
  const bibEntries = document.querySelectorAll(".bib-entry");

  console.log(`Found ${bibEntries.length} bibliography entries\n`);

  bibEntries.forEach((entry, index) => {
    try {
      // Extract citation information
      const citation = entry.querySelector(".bib-citation");
      if (!citation) return;

      const sourceUrl = citation.getAttribute("data-source-url") || "";
      const sourceTitle = citation.getAttribute("data-source-title") || "";
      const citationText = citation.textContent.replace(/\s+/g, " ").trim();

      // Extract annotation text
      const annotation = entry.querySelector(".annotation-text");
      let annotationText = "";
      let authorName = "";
      let dateAdded = "";

      if (annotation) {
        // Get the full text
        const fullText = annotation.textContent.trim();

        // Extract author info from annotation-author div
        const authorDiv = entry.querySelector(".annotation-author");
        if (authorDiv) {
          const authorText = authorDiv.textContent.trim();
          // Split by date pattern (MM/DD/YYYY)
          const match = authorText.match(/^(.+?)\s+(\d{1,2}\/\d{1,2}\/\d{4})$/);
          if (match) {
            authorName = match[1].trim();
            dateAdded = match[2].trim();
          } else {
            authorName = authorText;
          }
          // Get annotation without the author line
          annotationText = fullText.replace(authorText, "").trim();
        } else {
          annotationText = fullText;
        }
      }

      // Extract tags
      const tags = entry.getAttribute("data-tags") || "";
      const tagArray = tags ? tags.split(",").map((t) => t.trim()).filter((t) => t) : [];

      // Find the parent topic/subtopic
      let context = "";
      let topicId = "";
      let subtopicId = "";
      let category = "";

      const parentPage = entry.closest("[id]");
      if (parentPage) {
        const pageId = parentPage.id;

        // Get the page title for context
        const header = parentPage.querySelector(".topic-page-header h1");
        if (header) {
          context = header.textContent.trim();
        }

        // Check if this is a subtopic by looking at all subtopic cards
        const allSubtopicCards = document.querySelectorAll(".subtopic-card[onclick]");
        let isSubtopic = false;

        allSubtopicCards.forEach((card) => {
          const onclick = card.getAttribute("onclick");
          if (onclick && onclick.includes(`'${pageId}'`)) {
            isSubtopic = true;
            const match = onclick.match(/showSubtopicPage\('([^']+)',\s*'([^']+)'\)/);
            if (match) {
              topicId = match[1];
              subtopicId = match[2];
              category = `${topicId}/${subtopicId}`;
            }
          }
        });

        if (!isSubtopic) {
          topicId = pageId;
          category = topicId;
        }
      }

      // Create entry ID from source title
      const entryId = sourceTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .substring(0, 100) || `entry-${index}`;

      const entryData = {
        id: entryId,
        sourceUrl,
        sourceTitle,
        citation: citationText,
        annotation: annotationText,
        author: authorName,
        dateAdded: dateAdded || null,
        tags: tagArray,
        context,
        topicId,
        subtopicId,
        category,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      entries.push(entryData);
    } catch (error) {
      console.error(`Error processing entry ${index}:`, error.message);
    }
  });

  console.log(`Processed ${entries.length} entries\n`);
  console.log("Sample entry:");
  console.log(JSON.stringify(entries[0], null, 2));
  console.log("\n");

  // Upload to Firestore in batches (Firestore has a 500 operation limit per batch)
  const batchSize = 500;
  let uploadCount = 0;

  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = db.batch();
    const batchEntries = entries.slice(i, i + batchSize);

    batchEntries.forEach((entry) => {
      const docRef = db.collection("research_entries").doc(entry.id);
      batch.set(docRef, entry);
    });

    try {
      await batch.commit();
      uploadCount += batchEntries.length;
      console.log(`Uploaded batch: ${uploadCount}/${entries.length} entries`);
    } catch (error) {
      console.error("Error uploading batch:", error);
    }
  }

  console.log("\n✅ Migration complete!");
  console.log(`Total entries migrated: ${uploadCount}`);

  // Extract team member data
  await migrateTeamMembers(entries);
}

async function migrateTeamMembers(entries) {
  console.log("\nExtracting team member data...\n");

  const teamMembers = new Map();

  entries.forEach((entry) => {
    if (entry.author) {
      if (!teamMembers.has(entry.author)) {
        teamMembers.set(entry.author, {
          name: entry.author,
          contributions: 0,
          entries: [],
        });
      }
      const member = teamMembers.get(entry.author);
      member.contributions++;
      member.entries.push({
        id: entry.id,
        title: entry.sourceTitle,
        dateAdded: entry.dateAdded,
      });
    }
  });

  console.log(`Found ${teamMembers.size} team members\n`);

  // Upload team members to Firestore
  const batch = db.batch();

  teamMembers.forEach((data, name) => {
    const memberId = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const docRef = db.collection("team_members").doc(memberId);

    batch.set(docRef, {
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  try {
    await batch.commit();
    console.log("✅ Team members migrated successfully!");
  } catch (error) {
    console.error("Error uploading team members:", error);
  }
}

// Run migration
migrateEntries()
    .then(() => {
      console.log("\n🎉 All data migrated successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
