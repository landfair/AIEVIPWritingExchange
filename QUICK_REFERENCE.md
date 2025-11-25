# AIEVIPWritingExchange - Quick Reference Guide

## Key Statistics

| Metric | Value |
|--------|-------|
| Frontend Lines | 5,607 (index.html) |
| JavaScript Modules | 3 (auth.js, chatbot.js, entriesIndex.js) |
| Backend Lines | 140 (server.js) |
| Dependencies | 4 production packages |
| Node.js Version | 18+ required |
| Current Hosting | Render (free tier) |
| Database | None (embedded in HTML) |
| API Endpoints | 3 (GET /, GET /api/health, POST /api/chat) |
| Topics | 10+ with subtopics |
| Research Entries | ~100+ (count varies) |
| Auth Method | Google OAuth 2.0 (client-side) |

---

## File Quick Reference

| File | Lines | Purpose |
|------|-------|---------|
| public/index.html | 5,607 | Main SPA with all page content, styles, and DOM structure |
| public/auth.js | 283 | Google SSO authentication and role management |
| public/chatbot.js | 407 | Chat UI and API integration with Claude |
| public/entriesIndex.js | 260 | Research entry indexing and relevance scoring |
| server.js | 140 | Express server with /api/chat endpoint |
| package.json | 32 | Dependencies and scripts |
| render.yaml | 13 | Render deployment configuration |
| README.md | 300+ | User documentation |

---

## Critical API Endpoints

### POST /api/chat (Main Chatbot Endpoint)

```javascript
// Request
{
  "messages": [
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."}
  ],
  "entries": [
    {"id": "...", "title": "...", "author": "...", "snippet": "..."}
  ],
  "teamData": {
    "members": [{"name": "...", "contributions": 3}],
    "totalMembers": 12,
    "totalContributions": 45
  }
}

// Response
{
  "message": "AI response text",
  "usage": {"input_tokens": 1234, "output_tokens": 567},
  "modelUsed": "claude-3-5-sonnet-20241022"
}
```

---

## Environment Variables

**Required:**
```bash
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
```

**Optional:**
```bash
PORT=3000  # Default: 3000
NODE_VERSION=18.17.0
```

---

## Module Responsibilities

### auth.js (283 lines)
- Initialize Google Sign-In
- Decode and validate JWT tokens
- Assign TEAM/GUEST role based on email
- Persist session in localStorage
- Update UI based on auth state
- Handle sign-out and session expiry

### chatbot.js (407 lines)
- Create and manage chat UI
- Track message history (in-memory)
- Call POST /api/chat
- Render markdown responses
- Extract team member data
- Clear history on sign-in/sign-out

### entriesIndex.js (260 lines)
- Build index from .bib-entry elements
- Score entries by relevance
- Return top-10 matches for queries
- Track entry metadata (title, author, tags, context)

---

## Relevance Scoring Breakdown

```
Exact phrase in title:          +100 pts
Exact phrase in snippet:         +50 pts
Exact phrase in full text:       +20 pts

Per token (if length > 2):
  Title match:                   +15 pts each
  Snippet match:                 +10 pts each
  Full text match:                +3 pts each
  Tag match:                     +30 pts
  Context match:                  +5 pts
```

Example: Query "AI ethics" on entry titled "AI Ethics in Education"
- Phrase match in title: 100 pts
- Total Score: 100 pts (returned in top results)

---

## Role-Based Features

| Feature | Guest | Team (@nyu.edu) |
|---------|-------|-----------------|
| View entries | ✓ | ✓ |
| Search | ✓ | ✓ |
| Chat with AI | ✓ | ✓ |
| Add entries | ✗ | ✓ |
| Edit entries | ✗ | ✓ |
| See TEAM badge | ✗ | ✓ |
| Contribute button | Disabled | Enabled |

---

## Session Management

**Storage:** localStorage key = `ai_vip_auth`

**Structure:**
```json
{
  "email": "user@nyu.edu",
  "name": "John Doe",
  "picture": "https://...",
  "role": "team|guest",
  "signedInAt": "2025-11-25T10:00:00.000Z"
}
```

**Expiry:** 7 days (checked on page load)

**Reset On:**
- Page refresh (session restored if valid)
- Sign-in with different account
- Sign-out
- 7+ days since last sign-in

---

## Claude Model Fallback Chain

The backend tries these models in order:
1. claude-3-5-sonnet-20241022 (preferred)
2. claude-3-5-sonnet-20240620
3. claude-3-5-sonnet-latest
4. claude-3-opus-20240229
5. claude-3-sonnet-20240229
6. claude-3-haiku-20240307 (fallback)

**Token Settings:**
- Max output: 2,048 tokens
- Input: Flexible (no hard limit)

---

## Current Deployment (Render)

**Build Command:** `npm install`
**Start Command:** `npm start`
**Health Check:** `GET /api/health`

**Limitations:**
- Spins down after 15 min idle (free tier)
- Cold start: 30-60 seconds
- 750 hours/month limit (free tier)
- No database persistence
- No user backups

---

## Data Flow Summary

```
User Input
  ↓
chatbot.js: sendMessage()
  ↓
Extract relevant entries (entriesIndex.js)
  ↓
Extract team data from DOM
  ↓
POST /api/chat (server.js)
  ↓
Build system prompt with context
  ↓
Call Claude API
  ↓
Return response (JSON)
  ↓
Render in chat UI (markdown)
  ↓
Display to user
```

---

## Critical Paths for Firebase Migration

### 1. Research Entries
**Current:** Embedded HTML in index.html
**Needed:** Move to Firestore `research_entries` collection

**Structure:**
```javascript
{
  id: "entry-id",
  title: "Research Title",
  author: "Author Name",
  annotation: "Summary text...",
  snippet: "First 200 chars...",
  tags: ["tag1", "tag2"],
  sourceUrl: "https://...",
  topic: "topic-id",
  subtopic: "subtopic-id",
  createdAt: timestamp,
  updatedAt: timestamp,
  createdBy: "user-id"
}
```

### 2. Chat Endpoint
**Current:** Express server.js (POST /api/chat)
**Needed:** Firebase Cloud Function (callable or HTTP)

**Key requirement:** Must maintain same request/response format

### 3. User Storage
**Current:** localStorage only
**Needed:** Firebase Auth + Firestore `users` collection

**Structure:**
```javascript
{
  uid: "firebase-uid",
  email: "user@nyu.edu",
  name: "User Name",
  picture: "https://...",
  role: "team|guest",
  createdAt: timestamp,
  lastLogin: timestamp,
  contributions: ["entry-id-1", "entry-id-2"]
}
```

### 4. Chat History
**Current:** In-memory only (lost on reload)
**Needed:** Firestore `chat_histories` collection

**Structure:**
```javascript
{
  userId: "firebase-uid",
  conversationId: "conv-id",
  messages: [
    {
      role: "user|assistant",
      content: "...",
      timestamp: timestamp,
      tokenUsage: {input: X, output: Y}
    }
  ],
  entryReferences: ["entry-id-1", "entry-id-2"],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

## Testing Checklist for Firebase Migration

- [ ] Auth: Google Sign-In still works
- [ ] Auth: Role assignment correct (@nyu.edu = TEAM)
- [ ] Auth: Session persists across page reloads
- [ ] Chat: Can send messages
- [ ] Chat: Claude responds correctly
- [ ] Chat: Relevant entries passed to Claude
- [ ] Chat: History persists across reloads
- [ ] Entries: Display correctly from Firestore
- [ ] Entries: Search/index still works
- [ ] Entries: Navigation URLs work
- [ ] Contribute: NYU users can create entries
- [ ] Contribute: Non-NYU users cannot
- [ ] Team: Member list auto-updates
- [ ] Performance: Cold start < 5 seconds

---

## Common Error Scenarios

### Chat fails silently
- Check `ANTHROPIC_API_KEY` in environment
- Verify Claude API credits
- Check network requests in browser DevTools
- Check server logs on Render

### Google Sign-In button doesn't appear
- Check if Google Identity Services SDK loaded
- Verify Google OAuth Client ID is correct
- Check Google Cloud Console for authorized origins
- Verify current URL is in authorized origins

### Entries don't load
- Check entriesIndex.js console logs
- Verify .bib-entry elements exist in DOM
- Check if entriesIndexAPI.isReady() returns true
- Check for JavaScript errors in console

### Chat history clears unexpectedly
- Expected behavior: Clears on page reload, sign-in, sign-out
- This is intentional (see chatbot.js line 3-4)

---

## File Size Context

| Component | Size | % of Total |
|-----------|------|-----------|
| index.html | 345 KB | ~97% |
| chatbot.js | ~12 KB | ~3% |
| auth.js | ~8 KB | ~2% |
| entriesIndex.js | ~8 KB | ~2% |
| server.js | ~5 KB | ~1% |
| **Total** | **~360 KB** | **100%** |

**Note:** 97% of codebase is HTML/DOM (research entries, styles, structure)

---

## Key Classes & Selectors

```css
/* Structure */
.fixed-header               /* Top navigation */
.topic-pages                /* Main content area */
.topic-page-header          /* Topic/subtopic title */
.topic-content              /* Topic body */
.topic-categories           /* Main page categories */
.subtopic-card              /* Subtopic card */

/* Bibliography */
.bib-entry                  /* Research entry container */
.bib-citation               /* Citation header (purple bg) */
.annotation-text            /* Research summary */
.annotation-author          /* Author attribution */
.annotation-actions         /* Buttons (view, edit, delete) */

/* Chat */
.chat-button                /* Floating chat button */
.chat-panel                 /* Chat window */
.chat-messages              /* Message container */
.chat-message               /* Individual message */
.user-message               /* User message styling */
.bot-message                /* Bot message styling */

/* Auth */
.user-info                  /* User profile display */
.user-avatar                /* User profile picture */
.team-badge                 /* TEAM indicator */
.sign-out-btn               /* Sign out button */
```

---

## Performance Notes

**Frontend:**
- No minification (vanilla JS)
- No bundler (direct script imports)
- CSS embedded in HTML
- No caching strategy
- Responsive design (mobile-friendly)

**Backend:**
- Minimal dependencies (4 packages)
- No database queries (all data from frontend)
- Short request processing time
- Bottleneck: Claude API response time (5-30 seconds)

**Optimization Opportunities:**
- Split HTML into separate files
- Add request caching headers
- Implement service workers
- Minify CSS/JS
- Use database instead of HTML storage

---

## Render Deployment Details

**Service Type:** Web Service
**Runtime:** Node.js v18.17.0
**Build:** `npm install`
**Start:** `npm start`
**Health Check:** `/api/health`

**Webhook:** Auto-deploys on main branch push

**Limitations:**
- Free tier spins down after 15 min idle
- 750 hours/month limit
- First request after idle: 30-60 second cold start
- No database (stateless)

---

## Next Steps for Firebase Integration

1. **Prepare Data:**
   - Extract research entries from HTML
   - Create Firestore schema
   - Migrate team members data

2. **Setup Firebase:**
   - Create Firebase project
   - Enable Firestore, Auth, Hosting, Functions
   - Configure OAuth credentials
   - Import data

3. **Update Frontend:**
   - Replace entriesIndex.js with Firestore queries
   - Update auth.js to use Firebase Auth
   - Update chatbot.js to call Cloud Function
   - Deploy to Firebase Hosting

4. **Replace Backend:**
   - Create Cloud Function for /api/chat
   - Test Claude API integration
   - Add request validation and security rules

5. **Testing & Validation:**
   - Test all features with Firestore data
   - Verify auth and permissions
   - Load test chat endpoint
   - Monitor costs

