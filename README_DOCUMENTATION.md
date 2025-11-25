# AIEVIPWritingExchange Documentation Index

Welcome! This folder contains comprehensive analysis and documentation for the AIEVIPWritingExchange project. Below is a guide to help you navigate and understand the codebase.

## Documentation Files

### 1. PROJECT_OVERVIEW.md (START HERE)
**File Size:** 13 KB
**Read Time:** 10-15 minutes
**Best For:** Understanding the project at a high level

Covers:
- Executive summary
- What the application does
- Technical architecture overview
- Current limitations
- Firebase migration plan
- How to use the documentation

**Start here if you're new to the project.**

---

### 2. CODEBASE_ANALYSIS.md
**File Size:** 15 KB
**Read Time:** 20-30 minutes
**Best For:** Deep technical understanding

Covers:
- Complete project structure
- Technology stack details
- Frontend architecture (3 modules):
  - auth.js (283 lines)
  - chatbot.js (407 lines)
  - entriesIndex.js (260 lines)
- Backend architecture (server.js - 140 lines)
- Data models and storage
- Key features and functionality
- Dependencies and frameworks
- Current hosting setup
- Firebase integration opportunities

**Read this after PROJECT_OVERVIEW for comprehensive technical details.**

---

### 3. ARCHITECTURE_DIAGRAMS.md
**File Size:** 21 KB
**Read Time:** 15-20 minutes
**Best For:** Visual understanding of system design

Covers:
- System architecture diagram (browser, server, API flows)
- Chat query data flow
- Research entry structure
- Authentication flow
- Page navigation hierarchy
- Deployment architecture
- Relevance scoring algorithm
- Storage comparison (current vs Firebase)

**Use this to visualize how components interact.**

---

### 4. QUICK_REFERENCE.md
**File Size:** 11 KB
**Read Time:** 5-10 minutes for specific lookups
**Best For:** Quick lookups during development

Covers:
- Key statistics and metrics
- File quick reference table
- Critical API endpoints
- Environment variables
- Module responsibilities
- Relevance scoring breakdown
- Role-based features
- Session management
- Claude model fallback chain
- Deployment details
- Testing checklist
- Firebase migration paths
- Common error scenarios
- CSS classes and selectors
- Performance notes

**Use this as a reference while coding.**

---

## Recommended Reading Order

### If you're new to the project:
1. **PROJECT_OVERVIEW.md** - Get the big picture (10 min)
2. **CODEBASE_ANALYSIS.md** - Learn technical details (20 min)
3. **ARCHITECTURE_DIAGRAMS.md** - See visual flows (15 min)
4. **Source code** - Read actual files in /AIEVIPWritingExchange/

### If you're planning Firebase migration:
1. **PROJECT_OVERVIEW.md** - "Current Limitations & Why Firebase Is Needed" section
2. **CODEBASE_ANALYSIS.md** - "Firebase Integration Opportunities" section
3. **ARCHITECTURE_DIAGRAMS.md** - "Storage Comparison" section
4. **QUICK_REFERENCE.md** - "Critical Paths for Firebase Migration" section

### If you're debugging a specific issue:
1. **QUICK_REFERENCE.md** - "Common Error Scenarios" section
2. Review relevant source file
3. Check browser console and Render logs

### If you need a specific detail:
1. Use Ctrl+F to search this README
2. Jump to relevant documentation file
3. Use **QUICK_REFERENCE.md** for API/CSS details

---

## Project At A Glance

| Aspect | Details |
|--------|---------|
| **Type** | Web Application (SPA) |
| **Purpose** | Research knowledge base + AI chatbot |
| **Users** | NYU AI in Education VIP team |
| **Frontend** | Vanilla JavaScript (5,607 lines) |
| **Backend** | Node.js Express (140 lines) |
| **Database** | None (embedded in HTML) |
| **Auth** | Google OAuth 2.0 |
| **AI** | Anthropic Claude API |
| **Hosting** | Render (free tier) |
| **Status** | Fully functional, ready for Firebase migration |

---

## Key Directories

```
/Users/alexanderlandfair/Desktop/Projects/AIEFirebase/
├── README_DOCUMENTATION.md          (this file)
├── PROJECT_OVERVIEW.md              (start here)
├── CODEBASE_ANALYSIS.md            (detailed technical)
├── ARCHITECTURE_DIAGRAMS.md         (visual flows)
├── QUICK_REFERENCE.md              (quick lookup)
│
└── AIEVIPWritingExchange/           (actual source code)
    ├── public/
    │   ├── index.html              (5,607 lines - main SPA)
    │   ├── auth.js                 (283 lines - authentication)
    │   ├── chatbot.js              (407 lines - chat interface)
    │   └── entriesIndex.js         (260 lines - search/indexing)
    ├── server.js                   (140 lines - Express backend)
    ├── package.json               (dependencies)
    ├── package-lock.json          (lock file)
    ├── render.yaml               (Render deployment config)
    ├── README.md                 (user documentation)
    ├── .gitignore               (git ignore rules)
    └── .git/                    (repository)
```

---

## Key Insights

### Architecture
- **Frontend-Heavy:** 94.5% of code is frontend (HTML, CSS, JavaScript)
- **Minimal Backend:** Only 140 lines of Express server code
- **Modular:** 3 independent JavaScript modules that work together
- **Vanilla Stack:** No frameworks, no build step, no bundler

### Data Structure
- **Research Entries:** 5,607 lines of HTML containing all data
- **Storage:** localStorage for auth (7-day session)
- **Chat History:** In-memory only (lost on reload)
- **Team Data:** Extracted from DOM at runtime

### Current Limitations
- No database (entries hardcoded in HTML)
- No user management (auth is client-side only)
- No chat persistence (lost on page reload)
- Limited scalability (Render free tier limitations)
- No media support (text-only)

### Why Firebase Is Needed
1. **Database:** Move entries from HTML to Firestore
2. **User Management:** Proper auth + user tracking
3. **Persistence:** Store chat history
4. **Scalability:** Replace Render with Firebase
5. **Media:** Cloud Storage for attachments

---

## Technology Stack

**Frontend:**
- HTML5 + CSS3
- Vanilla JavaScript (no frameworks)
- Google Identity Services SDK
- Font Awesome 6.4.0
- Google Fonts

**Backend:**
- Node.js v18+
- Express.js v5.1.0
- @anthropic-ai/sdk v0.70.0
- CORS v2.8.5
- dotenv v17.2.3

**Infrastructure:**
- Render (current hosting)
- GitHub (version control)
- Google Cloud (OAuth)
- Anthropic Claude (AI)

**Proposed (Firebase):**
- Firebase Auth
- Cloud Firestore
- Cloud Functions
- Firebase Hosting
- Cloud Storage
- Firebase Analytics

---

## Quick Links

### API Endpoints
- `GET /` - Serves main application
- `GET /api/health` - Health check
- `POST /api/chat` - AI chatbot endpoint

### Important Classes/IDs
- `.fixed-header` - Top navigation
- `.topic-pages` - Main content
- `.bib-entry` - Research entry
- `.chat-panel` - Chat window
- `#auth-container` - Auth UI
- `#team-members-list` - Team list
- `#chat-messages` - Chat history

### Storage Keys
- `ai_vip_auth` - User session (localStorage)
- No other local storage used

### Configuration
- `ANTHROPIC_API_KEY` - Required environment variable
- `PORT` - Optional (default: 3000)
- `render.yaml` - Render deployment config

---

## Development Workflow

### To Understand Code:
1. Read PROJECT_OVERVIEW.md
2. Read CODEBASE_ANALYSIS.md
3. Read ARCHITECTURE_DIAGRAMS.md
4. Read source files in order:
   - public/index.html (main SPA)
   - public/auth.js (authentication)
   - public/chatbot.js (chat interface)
   - public/entriesIndex.js (search)
   - server.js (backend)

### To Make Changes:
1. Review QUICK_REFERENCE.md for relevant section
2. Locate code in source files
3. Test changes locally
4. Commit and push to GitHub
5. Render auto-deploys

### To Plan Firebase Migration:
1. Read "Firebase Integration Opportunities" in CODEBASE_ANALYSIS.md
2. Read "Critical Paths for Firebase Migration" in QUICK_REFERENCE.md
3. Review Firebase section in PROJECT_OVERVIEW.md
4. Follow migration plan

---

## Common Tasks

### Understanding a specific feature:
1. Search QUICK_REFERENCE.md for the feature
2. Look up CSS class/ID in "Key Classes & Selectors"
3. Find in source code using browser DevTools
4. Read CODEBASE_ANALYSIS.md for context

### Debugging an issue:
1. Check browser console for errors
2. Check Render logs
3. Review "Common Error Scenarios" in QUICK_REFERENCE.md
4. Read relevant source file

### Adding a new feature:
1. Understand current architecture (ARCHITECTURE_DIAGRAMS.md)
2. Plan data structure (CODEBASE_ANALYSIS.md)
3. Find relevant module (auth.js, chatbot.js, entriesIndex.js)
4. Make changes and test
5. Document changes

---

## File Statistics

| File | Lines | Size | Purpose |
|------|-------|------|---------|
| index.html | 5,607 | 345 KB | Main SPA |
| auth.js | 283 | 8 KB | Authentication |
| chatbot.js | 407 | 12 KB | Chat interface |
| entriesIndex.js | 260 | 8 KB | Search/indexing |
| server.js | 140 | 5 KB | Express backend |
| package.json | 32 | 1 KB | Dependencies |
| render.yaml | 13 | 1 KB | Deployment config |

---

## What Each File Does

### public/index.html (5,607 lines)
Contains:
- All page HTML structure
- All CSS styling (embedded)
- All content (topics, subtopics, entries)
- Team members list
- Script tag loading other modules
- Responsive design for all screen sizes

### public/auth.js (283 lines)
Handles:
- Google Sign-In initialization
- JWT token parsing and validation
- Role assignment (TEAM vs GUEST)
- Session management (localStorage)
- UI updates for authentication state
- Sign-out logic

### public/chatbot.js (407 lines)
Provides:
- Chat UI creation and management
- Message history tracking
- API calls to /api/chat
- Markdown rendering for responses
- Team member data extraction
- Chat history clearing on sign-in/out

### public/entriesIndex.js (260 lines)
Implements:
- Research entry indexing from DOM
- Relevance scoring algorithm
- Query matching and ranking
- Return top-10 most relevant entries
- Entry metadata extraction

### server.js (140 lines)
Serves:
- Express app setup
- CORS and JSON middleware
- Static file serving
- GET / (serves index.html)
- GET /api/health (health check)
- POST /api/chat (Claude API integration)

---

## Next Steps

1. **If you're new:** Read PROJECT_OVERVIEW.md
2. **If migrating to Firebase:** Read "Firebase Integration Opportunities" section
3. **If developing:** Keep QUICK_REFERENCE.md handy
4. **If debugging:** Check "Common Error Scenarios" in QUICK_REFERENCE.md

---

## Summary

This documentation provides everything you need to understand, develop, and migrate the AIEVIPWritingExchange project. The four markdown files cover different aspects:

- **PROJECT_OVERVIEW.md** - High-level understanding
- **CODEBASE_ANALYSIS.md** - Technical details
- **ARCHITECTURE_DIAGRAMS.md** - Visual flows
- **QUICK_REFERENCE.md** - Quick lookups

Combined with the source code in the AIEVIPWritingExchange folder, you have a complete understanding of the system.

Good luck with development and Firebase migration!

---

**Last Updated:** November 25, 2025
**Documentation Version:** 1.0
**Source Code Location:** `/Users/alexanderlandfair/Desktop/Projects/AIEFirebase/AIEVIPWritingExchange/`
