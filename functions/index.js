// Firebase Cloud Functions for AI Education VIP Research Exchange
// Replaces the Express.js server with serverless functions

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const Anthropic = require("@anthropic-ai/sdk");

// Initialize Firebase Admin
admin.initializeApp();

// Chat endpoint - handles AI chatbot requests
exports.chat = functions
    .runWith({
      secrets: ["ANTHROPIC_API_KEY"],
    })
    .https.onCall(async (data, context) => {
      try {
        // Initialize Anthropic client with the secret
        const anthropic = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY,
        });

        const { messages, entries, teamData } = data;

        if (!messages || !Array.isArray(messages)) {
          throw new functions.https.HttpsError("invalid-argument", "Messages array is required");
        }

        // Build comprehensive system message with all available context
        let systemMessage = `You are a helpful AI assistant for the AI in Education VIP Research Exchange website. Your role is to answer questions about AI in education research, team members, and the site content.

IMPORTANT CAPABILITIES:
- Answer questions about research entries, team members, contributions, and site content
- Use reasoning and inference to answer questions even if the answer isn't explicitly stated
- Count and aggregate data (e.g., "how many contributions does X have?")
- Compare and analyze information across multiple entries
- Provide insights based on the available data

When answering questions:
1. Provide clear, concise, and accurate information
2. Use the provided data to infer answers even if not explicitly stated
3. For questions about team members, use the team member data provided
4. For questions requiring counting or aggregation, calculate from the available data
5. IMPORTANT: When asked about a specific team member's contributions, ONLY reference entries where that person is listed as the "Author/Contributor"
6. Do NOT include entries where the person's name appears in the content but they are not the author
7. When referencing research entries, mention the title and author, but DO NOT include clickable links
8. Keep responses conversational and informative without URLs or link formatting

`;

        // Add team member information to context
        if (teamData && teamData.members && teamData.members.length > 0) {
          systemMessage += `\nTEAM MEMBER INFORMATION:\n`;
          systemMessage += `Total team members: ${teamData.totalMembers}\n`;
          systemMessage += `Total contributions: ${teamData.totalContributions}\n\n`;
          systemMessage += `Team members and their contributions:\n`;
          teamData.members.forEach((member, idx) => {
            systemMessage += `${idx + 1}. ${member.name}: ${member.contributions} contribution(s)\n`;
          });
          systemMessage += `\n`;
        }

        // Add research entries to context
        if (entries && entries.length > 0) {
          systemMessage += `\nRESEARCH ENTRIES (${entries.length} relevant entries):\n\n`;
          entries.forEach((entry, idx) => {
            systemMessage += `${idx + 1}. Title: ${entry.title}\n`;
            if (entry.author) {
              systemMessage += `   Author/Contributor: ${entry.author}\n`;
            }
            systemMessage += `   URL: ${entry.url}\n`;
            if (entry.snippet) {
              systemMessage += `   Summary: ${entry.snippet}\n`;
            }
            systemMessage += `\n`;
          });
        }

        // Use Claude Haiku for fast and cost-effective responses
        const response = await anthropic.messages.create({
          model: "claude-3-5-haiku-20241022",
          max_tokens: 2048,
          system: systemMessage,
          messages: messages,
        });

        // Extract text from response
        const assistantMessage = response.content[0].text;

        return {
          message: assistantMessage,
          usage: response.usage,
          modelUsed: "claude-3-5-haiku-20241022",
        };
      } catch (error) {
        console.error("Error calling Claude API:", error);
        throw new functions.https.HttpsError("internal", "Failed to get response from AI", error.message);
      }
    });

// Health check endpoint
exports.health = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "AI Education VIP Research Exchange API",
    });
  });
});

// API wrapper function to handle routing
// Note: The chat endpoint is now a callable function (exports.chat)
// and should be called via Firebase SDK's httpsCallable('chat')
exports.api = functions
    .runWith({
      secrets: ["ANTHROPIC_API_KEY"],
    })
    .https.onRequest((req, res) => {
      return cors(req, res, async () => {
        const path = req.path;

        // Route to appropriate handler
        if (path === "/health" && req.method === "GET") {
          // Forward to health function
          return exports.health(req, res);
        } else {
          return res.status(404).json({
            error: "Not found",
            path: path,
            availableEndpoints: ["/health (GET)"],
            note: "Chat endpoint is a callable function - use Firebase SDK's httpsCallable('chat')",
          });
        }
      });
    });
