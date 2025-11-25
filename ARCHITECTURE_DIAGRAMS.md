# AIEVIPWritingExchange - Architecture Diagrams

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        User Browser                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           index.html (SPA - 5,607 lines)             │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │  DOM Structure                              │    │   │
│  │  │  - Fixed header with title & search        │    │   │
│  │  │  - Topic pages (10+)                       │    │   │
│  │  │  - Subtopic pages                         │    │   │
│  │  │  - Bibliography entries with annotations  │    │   │
│  │  │  - Team members list                       │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  │                                                      │   │
│  │  ┌──────────────────────────────────────────┐      │   │
│  │  │  JavaScript Modules                      │      │   │
│  │  ├──────────────────────────────────────────┤      │   │
│  │  │ 1. auth.js (283 lines)                   │      │   │
│  │  │    - Google Sign-In                      │      │   │
│  │  │    - JWT parsing (client-side)           │      │   │
│  │  │    - Role assignment (TEAM/GUEST)        │      │   │
│  │  │    - localStorage session mgmt           │      │   │
│  │  ├──────────────────────────────────────────┤      │   │
│  │  │ 2. chatbot.js (407 lines)                │      │   │
│  │  │    - Chat UI management                  │      │   │
│  │  │    - Message history (in-memory)         │      │   │
│  │  │    - API calls to /api/chat              │      │   │
│  │  │    - Markdown rendering                  │      │   │
│  │  │    - Team data extraction                │      │   │
│  │  ├──────────────────────────────────────────┤      │   │
│  │  │ 3. entriesIndex.js (260 lines)           │      │   │
│  │  │    - Index building from DOM             │      │   │
│  │  │    - Relevance scoring algorithm         │      │   │
│  │  │    - Query matching                      │      │   │
│  │  │    - Returns top-10 results              │      │   │
│  │  └──────────────────────────────────────────┘      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  External Services (Client-side)                    │   │
│  │  - Google Identity Services SDK (auth)              │   │
│  │  - Font Awesome 6.4.0 (icons)                       │   │
│  │  - Google Fonts (typography)                        │   │
│  │  - localStorage (session persistence)               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
          ↕ HTTP Requests/Responses           ↕
┌─────────────────────────────────────────────────────────────┐
│              Express.js Server (Node.js)                     │
│              Render PaaS Hosting (Free Tier)                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  server.js (140 lines)                              │   │
│  │  ┌────────────────────────────────────────────┐    │   │
│  │  │ Express Middleware Stack                   │    │   │
│  │  │ - CORS enabled                             │    │   │
│  │  │ - JSON body parser (10MB limit)            │    │   │
│  │  │ - Static file serving (/public)            │    │   │
│  │  └────────────────────────────────────────────┘    │   │
│  │  ┌────────────────────────────────────────────┐    │   │
│  │  │ API Endpoints                              │    │   │
│  │  │ - GET /          (serves index.html)       │    │   │
│  │  │ - GET /api/health                          │    │   │
│  │  │ - POST /api/chat (main endpoint)           │    │   │
│  │  └────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Dependencies                                       │   │
│  │  - Express.js v5.1.0                               │   │
│  │  - @anthropic-ai/sdk v0.70.0                       │   │
│  │  - CORS v2.8.5                                     │   │
│  │  - dotenv v17.2.3                                  │   │
│  │  - Node.js v18+                                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
          ↕ HTTP POST /api/chat              ↕
┌─────────────────────────────────────────────────────────────┐
│              Anthropic Claude API                            │
├─────────────────────────────────────────────────────────────┤
│  AI Models (Fallback Chain):                                │
│  1. claude-3-5-sonnet-20241022 (preferred)                 │
│  2. claude-3-5-sonnet-20240620                             │
│  3. claude-3-5-sonnet-latest                               │
│  4. claude-3-opus-20240229                                 │
│  5. claude-3-sonnet-20240229                               │
│  6. claude-3-haiku-20240307 (fallback)                     │
│                                                               │
│  System Prompt:                                             │
│  - Research entries context (title, author, URL, snippet) │
│  - Team member data (name, contribution count)            │
│  - Behavioral instructions                               │
│  - Token limit: 2,048 output tokens                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Chat Query

```
User enters message
        ↓
1. chatbot.js: sendMessage()
        ↓
2. Extract relevant entries
   entriesIndexAPI.getRelevantEntries(message, 10)
   - Scores all entries
   - Returns top-10 by relevance
        ↓
3. Extract team member data from DOM
   getTeamMemberData()
   - Scans #team-members-list
   - Extracts name & contribution count
        ↓
4. Build API request
   POST /api/chat with:
   - messages (chat history)
   - entries (top-10 relevant)
   - teamData (members & stats)
        ↓
5. Server receives request
   server.js: /api/chat endpoint
        ↓
6. Build system prompt with context
   - Research entries
   - Team member data
   - Behavioral instructions
        ↓
7. Call Claude API
   anthropic.messages.create()
   - Try model 1, if fails try model 2, etc.
   - Max 2,048 output tokens
        ↓
8. Return response to client
   {
     "message": "AI response",
     "usage": { input_tokens: X, output_tokens: Y },
     "modelUsed": "claude-3-5-sonnet-20241022"
   }
        ↓
9. Render in chat UI
   - Parse markdown
   - Add to messages array
   - Scroll to bottom
```

---

## Data Structure: Research Entry

```
HTML Structure (in index.html):
┌─────────────────────────────────────────────────────────┐
│ <div class="bib-entry" id="entry-123" data-tags="tag1"> │
│                                                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │ <div class="bib-citation"                         │  │
│  │       data-source-title="Research Title"          │  │
│  │       data-source-url="https://...">              │  │
│  │   Citation Text (Author, Year, etc.)              │  │
│  │ </div>                                             │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │ <div class="annotation-text">                      │  │
│  │   Summary of the research entry.                   │  │
│  │   Can include notes and observations.              │  │
│  │ </div>                                             │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │ <div class="annotation-author">                    │  │
│  │   Author Name, Date, Notes                        │  │
│  │ </div>                                             │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
│  <buttons for actions>                                   │
│                                                           │
└─────────────────────────────────────────────────────────┘

Indexed Data (in JavaScript):
{
  id: "entry-123",
  title: "Research Title",
  author: "Author Name",
  snippet: "First 200 chars of annotation...",
  url: "/?topic=topic-id&subtopic=subtopic-id#entry-123",
  fullText: "Combined searchable text",
  citationText: "Full citation text",
  annotationText: "Full annotation text",
  sourceUrl: "https://external-source.com",
  tags: ["tag1", "tag2"],
  context: "Topic/Subtopic Name",
  score: 150  // Relevance score (calculated per query)
}
```

---

## Authentication Flow

```
User clicks "Sign In with Google"
        ↓
Google Identity Services SDK
  (Loaded from: https://accounts.google.com/gsi/client)
        ↓
Google OAuth 2.0 Authorization
  Client ID: 65317156873-o4s0gqor74r2nshde0t93jakod1ktutf.apps.googleusercontent.com
  Scopes: email, name, picture
        ↓
User grants permission (or already logged in)
        ↓
Return JWT credential to app
        ↓
auth.js: handleGoogleSignIn()
  - Decode JWT (parseJwt)
  - Extract email, name, picture
        ↓
Determine role:
  if (email.endsWith('@nyu.edu'))
    role = 'team'
  else
    role = 'guest'
        ↓
Store in localStorage:
  localStorage.setItem('ai_vip_auth', JSON.stringify({
    email, name, picture, role, signedInAt
  }))
        ↓
Update UI:
  - Show user avatar & TEAM badge (if applicable)
  - Enable/disable contribute buttons
  - Clear chat history
        ↓
Emit custom event:
  window.dispatchEvent(
    new CustomEvent('authStateChanged', { detail: currentUser })
  )
        ↓
Show welcome notification
```

---

## Page Navigation Structure

```
Main Index
├── Topic 1: "Students and AI"
│   ├── Subtopic 1.1: "AI Literacy"
│   │   └── Bibliography entries...
│   ├── Subtopic 1.2: "AI Ethics"
│   │   └── Bibliography entries...
│   └── Subtopic 1.3: "Student Perceptions"
│       └── Bibliography entries...
│
├── Topic 2: "Teachers and AI"
│   ├── Subtopic 2.1: "Professional Development"
│   │   └── Bibliography entries...
│   ├── Subtopic 2.2: "AI in Curriculum"
│   │   └── Bibliography entries...
│   └── Subtopic 2.3: "Assessment with AI"
│       └── Bibliography entries...
│
├── Topic 3: "Institutions and AI"
│   ├── Subtopic 3.1: "Policy"
│   │   └── Bibliography entries...
│   └── Subtopic 3.2: "Infrastructure"
│       └── Bibliography entries...
│
└── ... (additional topics)

URL Navigation:
- Main page: /
- Topic page: /?topic=students-and-ai
- Subtopic: /?topic=students-and-ai&subtopic=ai-literacy
- Entry: /?topic=students-and-ai&subtopic=ai-literacy#entry-123
```

---

## Deployment Architecture (Current - Render)

```
┌─────────────────────┐
│   GitHub Repository │
│  AI_Education_VIP_  │
│ ResearachExchange   │
└──────────┬──────────┘
           │ push/merge to main
           ↓
┌─────────────────────────────────────────┐
│  GitHub Webhook Trigger                 │
└──────────────┬──────────────────────────┘
               │ triggers
               ↓
┌─────────────────────────────────────────┐
│  Render Build Process                   │
│  1. Clone repo                          │
│  2. npm install                         │
│  3. npm start (server.js)               │
│  4. Start health checks                 │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│  Render Web Service                     │
│  - Free tier: 750 hrs/month             │
│  - Spins down after 15 min idle         │
│  - Cold start: 30-60 seconds            │
│  - Health check: GET /api/health        │
│  - Auto-deploy on push                  │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│  Public URL                             │
│  https://[service-name].onrender.com    │
│  - HTTPS by default                     │
│  - Accessible globally                  │
└─────────────────────────────────────────┘

Environment Variables (on Render):
- NODE_VERSION=18.17.0
- ANTHROPIC_API_KEY=sk-ant-... (set manually)
```

---

## Relevance Scoring Algorithm

```
For each query, each entry gets scored:

1. Exact phrase match in title:        +100 points
2. Exact phrase match in snippet:      +50 points
3. Exact phrase match in full text:    +20 points

4. For each query token (length > 2):
   - Title matches × 15 points each
   - Snippet matches × 10 points each
   - Full text matches × 3 points each
   - Tag exact match: +30 points
   - Context match: +5 points

Example:
Query: "AI ethics education"
Tokens: ["ethics", "education"]  (skip "ai" - too short)

Entry 1: "AI Ethics in K-12 Education"
- Phrase match in title? No
- "ethics" in title: 1 match × 15 = 15
- "education" in title: 1 match × 15 = 15
- Tag match for "ethics"? Yes = +30
- Total: 60 points

Entry 2: "Student Attitudes Toward AI"
- Phrase match in title? No
- "ethics" in title: 0
- "education" in snippet: 2 matches × 10 = 20
- Total: 20 points

Result: Entry 1 ranked first (60 > 20)

Final: Return top 10 entries sorted by score
```

---

## Storage Comparison: Current vs Firebase

```
CURRENT ARCHITECTURE (Render + Render)
└─ No Database
   ├─ Research entries: Embedded in HTML (5,607 lines)
   ├─ User auth: localStorage (7-day session)
   ├─ Chat history: In-memory only (lost on page reload)
   └─ Team members: Hardcoded in HTML

FIREBASE ARCHITECTURE (Proposed)
└─ Cloud Firestore (Document Database)
   ├─ research_entries collection
   │  ├─ id, title, author, snippet, annotation
   │  ├─ tags[], sourceUrl, createdAt, updatedAt
   │  └─ topic, subtopic context
   ├─ users collection
   │  ├─ uid, email, name, picture, role
   │  ├─ createdAt, lastLogin, contributions[]
   │  └─ preferences
   ├─ chat_histories collection
   │  ├─ userId, messages[], createdAt
   │  ├─ entryReferences[], timestamps
   │  └─ metadata (length, duration, model used)
   ├─ team_members collection
   │  ├─ uid, name, email, role
   │  ├─ contributionCount, contributions[]
   │  └─ joinDate
   └─ system_metadata collection
      ├─ totalEntries, totalMembers
      └─ lastUpdated

Firebase Auth (existing Google OAuth compatible)
  └─ Users can sign in with Google
     └─ Email/role auto-determined
     └─ UID created in Firebase

Cloud Storage (for media)
  └─ PDFs, images, attachments
     └─ Linked from research entries

Firebase Hosting
  └─ Deploy static frontend
     └─ Automatic HTTPS, CDN

Cloud Functions (Callable)
  └─ /api/chat -> Callable Function
     └─ Receives message
     └─ Calls Claude API
     └─ Stores history in Firestore
```
