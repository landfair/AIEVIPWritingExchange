# AIEVIPWritingExchange - Project Overview & Firebase Migration Guide

## Executive Summary

**AIEVIPWritingExchange** is a collaborative research knowledge base web application built for NYU's AI in Education VIP team. It combines a research repository with an AI-powered chatbot (powered by Claude) to help users explore and understand AI in education research.

### Current State
- **Frontend:** Vanilla JavaScript SPA (5,607 lines of HTML/CSS/JS)
- **Backend:** Node.js Express server (140 lines)
- **Hosting:** Render (free tier, auto-deploys from GitHub)
- **Database:** None - all data embedded in HTML
- **Authentication:** Google OAuth 2.0 (client-side)
- **AI Integration:** Anthropic Claude API
- **Status:** Fully functional but ready for database migration

---

## What This Project Does

### User-Facing Features

1. **Research Repository**
   - Organized by topics (e.g., "Students and AI") with subtopics
   - Each entry has citation, annotation, author attribution
   - Supports tags and full-text search
   - Responsive design for mobile/tablet/desktop

2. **AI-Powered Chatbot**
   - Ask questions about research entries
   - Automatically finds relevant papers
   - Provides summaries and comparisons
   - Multi-turn conversations
   - Team member contribution tracking

3. **Role-Based Permissions**
   - NYU email users (@nyu.edu) = TEAM role
     - Can create new entries
     - Can edit/delete entries
     - See TEAM badge
   - Non-NYU users = GUEST role
     - Read-only access
     - Can still use chatbot

4. **Team Collaboration**
   - View team member profiles with contribution counts
   - Track who contributed what
   - Central research hub for team

---

## Technical Architecture

### Frontend Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **HTML** | 5,607 lines | All page content, structure |
| **CSS** | Embedded | Responsive design, styles |
| **JavaScript** | Vanilla (3 modules) | Interactivity, API calls |
| **Auth** | Google Identity Services | SSO authentication |
| **Search** | Client-side algorithm | Relevance scoring |

### Backend Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Server** | Express.js v5.1.0 | HTTP server |
| **AI** | @anthropic-ai/sdk v0.70.0 | Claude API integration |
| **CORS** | cors v2.8.5 | Cross-origin requests |
| **Config** | dotenv v17.2.3 | Environment variables |

### Deployment

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Hosting** | Render | PaaS platform |
| **Repository** | GitHub | Source control |
| **CI/CD** | Render webhooks | Auto-deploy on push |
| **DNS** | Render provided | https://[name].onrender.com |

---

## Code Organization

### Public Folder (Frontend)

```
public/
├── index.html (5,607 lines)
│   ├── Topics section (10+ topics)
│   ├── Subtopics (dynamic pages)
│   ├── Bibliography entries (~100+)
│   ├── Team members list
│   ├── CSS styles (embedded)
│   └── Script tags (auth.js, chatbot.js, entriesIndex.js)
├── auth.js (283 lines)
│   ├── Google Sign-In initialization
│   ├── JWT token parsing
│   ├── Role assignment (TEAM/GUEST)
│   ├── Session management
│   └── UI updates
├── chatbot.js (407 lines)
│   ├── Chat UI creation
│   ├── Message history tracking
│   ├── API integration (/api/chat)
│   ├── Markdown rendering
│   └── Team data extraction
└── entriesIndex.js (260 lines)
    ├── Index building from DOM
    ├── Relevance scoring
    ├── Query matching
    └── Result ranking
```

### Root Level (Backend)

```
├── server.js (140 lines)
│   ├── Express app initialization
│   ├── Middleware setup (CORS, JSON parser)
│   ├── GET / (serves index.html)
│   ├── GET /api/health (health check)
│   └── POST /api/chat (main AI endpoint)
├── package.json (32 lines)
│   └── Dependencies: express, @anthropic-ai/sdk, cors, dotenv
├── render.yaml
│   └── Render deployment configuration
└── README.md
    └── User-facing documentation
```

---

## How Data Flows

### Chat Query Flow

```
1. User types message in chat
2. chatbot.js captures input
3. entriesIndex.js finds top-10 relevant entries
4. Extract team member data from DOM
5. POST request to /api/chat
6. server.js receives and validates
7. Build system prompt with context
8. Call Claude API
9. Return response JSON
10. chatbot.js renders markdown
11. Display in chat panel
```

### Research Entry Structure

Each entry contains:
- **Citation:** Formal citation text + metadata
- **Annotation:** Summary/notes about the research
- **Author:** Who added/contributed the entry
- **Tags:** Categorization labels
- **Source URL:** Link to original paper
- **Topic/Subtopic:** Organizational context

---

## Key Features Explained

### 1. Smart Search & Relevance

The `entriesIndex.js` module scores entries using a weighted algorithm:
- Exact phrase match in title: +100 points
- Exact phrase match in snippet: +50 points
- Token matches in title: +15 per match
- Token matches in snippet: +10 per match
- Tag matches: +30 points
- Context matches: +5 points

Example: Query "AI ethics education" finds entries about ethics highest-scored.

### 2. Role-Based Access Control

```javascript
User email ends with @nyu.edu? 
  YES → role = "team" (can contribute)
  NO  → role = "guest" (read-only)
```

The role is determined by email domain only (no backend validation).

### 3. Session Persistence

- Store user data in browser localStorage
- Key: `ai_vip_auth`
- Expires after 7 days of inactivity
- Auto-restored on page reload

### 4. Multi-Turn Conversations

- Keep full chat history in memory
- Send all previous messages to Claude
- Claude understands conversation context
- History lost on page reload (currently)

---

## Current Limitations & Why Firebase Is Needed

### Limitation 1: No Database
**Problem:** All research entries are hardcoded in HTML (5,607 lines)
- Adding entries requires editing HTML and redeploying
- No way to edit/delete entries through UI
- Scalability nightmare (HTML grows with data)
- No data persistence beyond what's in code

**Solution:** Move entries to Firestore database

### Limitation 2: No User Management
**Problem:** Authentication is client-side only
- No user profiles
- No contribution tracking
- No permissions enforcement
- Anyone can become "TEAM" if they spoof JWT

**Solution:** Use Firebase Auth + Firestore users collection

### Limitation 3: No Chat History Persistence
**Problem:** Chat clears on every page reload
- Users lose conversation context
- No analytics on chatbot usage
- No conversation search

**Solution:** Store in Firestore chat_histories collection

### Limitation 4: Limited Scalability
**Problem:** Render free tier limitations
- Spins down after 15 minutes idle
- 750 hours/month limit
- Cold start delays (30-60 seconds)
- No database

**Solution:** Firebase Hosting + Cloud Functions + Firestore

### Limitation 5: No Media Support
**Problem:** Can't attach PDFs, images, etc.
- All content must be text
- Can't link to papers directly
- Limited research documentation

**Solution:** Firebase Cloud Storage for media files

---

## Firebase Migration Plan

### Phase 1: Preparation
1. Extract research entries from HTML into Firestore schema
2. Create Firestore database structure
3. Plan migration timeline

### Phase 2: Setup Firebase
1. Create Firebase project
2. Enable Firestore, Auth, Cloud Functions, Hosting, Storage
3. Configure Google OAuth credentials
4. Set up security rules

### Phase 3: Update Frontend
1. Replace entriesIndex.js with Firestore queries
2. Update auth.js for Firebase Auth
3. Update chatbot.js to call Cloud Function
4. Deploy to Firebase Hosting

### Phase 4: Replace Backend
1. Create Cloud Function for /api/chat
2. Test with Claude API
3. Implement request validation
4. Add security rules

### Phase 5: Testing & Optimization
1. Test all features
2. Verify permissions
3. Load test
4. Monitor costs
5. Optimize performance

---

## File Reference Guide

### Analyze These First

1. **CODEBASE_ANALYSIS.md** (Comprehensive deep dive)
   - Project structure
   - Technology details
   - All 3 frontend modules
   - Backend architecture
   - Data models
   - Dependencies

2. **ARCHITECTURE_DIAGRAMS.md** (Visual documentation)
   - System architecture diagram
   - Data flow diagrams
   - Module responsibilities
   - Authentication flow
   - Storage comparison

3. **QUICK_REFERENCE.md** (Quick lookup)
   - Key statistics
   - API endpoints
   - Module responsibilities
   - Firebase migration paths
   - Testing checklist

### Source Code to Review

1. `/Users/alexanderlandfair/Desktop/Projects/AIEFirebase/AIEVIPWritingExchange/public/index.html`
   - Main SPA (5,607 lines)
   - Contains ALL page content
   - Styles and structure

2. `/Users/alexanderlandfair/Desktop/Projects/AIEFirebase/AIEVIPWritingExchange/public/auth.js`
   - Google SSO implementation (283 lines)
   - Role assignment logic
   - Session management

3. `/Users/alexanderlandfair/Desktop/Projects/AIEFirebase/AIEVIPWritingExchange/public/chatbot.js`
   - Chat UI and API integration (407 lines)
   - Markdown rendering
   - Team data extraction

4. `/Users/alexanderlandfair/Desktop/Projects/AIEFirebase/AIEVIPWritingExchange/public/entriesIndex.js`
   - Research entry indexing (260 lines)
   - Relevance scoring algorithm
   - Search implementation

5. `/Users/alexanderlandfair/Desktop/Projects/AIEFirebase/AIEVIPWritingExchange/server.js`
   - Express backend (140 lines)
   - Claude API integration
   - API endpoints

6. `/Users/alexanderlandfair/Desktop/Projects/AIEFirebase/AIEVIPWritingExchange/render.yaml`
   - Current Render configuration
   - Build and deploy settings

---

## Key Metrics

| Metric | Value |
|--------|-------|
| Total Lines of Code | ~6,300 |
| Frontend Lines | 5,957 (94.5%) |
| Backend Lines | 140 (2.2%) |
| Config/Other Lines | ~200 (3.3%) |
| JavaScript Modules | 3 |
| API Endpoints | 3 |
| Dependencies | 4 |
| Current Hosting | Render free tier |
| Target Database | Firestore |
| Auth Method | Google OAuth 2.0 |
| AI Provider | Anthropic Claude |

---

## Technology Stack Summary

### Frontend
- Vanilla JavaScript (no framework)
- HTML5 + CSS3
- Google Identity Services SDK
- Font Awesome 6.4.0
- Google Fonts (Playfair Display, Open Sans)

### Backend
- Node.js v18+
- Express.js v5.1.0
- @anthropic-ai/sdk v0.70.0
- CORS v2.8.5
- dotenv v17.2.3

### Current Infrastructure
- Render (PaaS)
- GitHub (version control)
- Google Cloud (OAuth credentials)
- Anthropic API (AI)

### Proposed Infrastructure (Firebase)
- Firebase Auth
- Cloud Firestore
- Cloud Functions
- Firebase Hosting
- Cloud Storage
- Firebase Analytics

---

## How to Use This Documentation

### For Firebase Migration Planning
1. Start with **CODEBASE_ANALYSIS.md** - "Firebase Integration Opportunities" section
2. Review **ARCHITECTURE_DIAGRAMS.md** - "Storage Comparison" section
3. Follow **QUICK_REFERENCE.md** - "Critical Paths for Firebase Migration"

### For Understanding the Current System
1. Read **PROJECT_OVERVIEW.md** (this file)
2. Study **CODEBASE_ANALYSIS.md** - Full technical details
3. Reference **ARCHITECTURE_DIAGRAMS.md** - Visual flows

### For Development
1. Check **QUICK_REFERENCE.md** - File locations, APIs, selectors
2. Review source files in `/public/` directory
3. Test changes locally before pushing

### For Troubleshooting
1. See **QUICK_REFERENCE.md** - "Common Error Scenarios"
2. Check browser console for errors
3. Review Render logs for backend errors

---

## Next Steps

### Immediate (Planning)
- [ ] Review all three documentation files
- [ ] Study the source code
- [ ] Understand current architecture
- [ ] Plan Firestore schema

### Short Term (Preparation)
- [ ] Extract research entries from HTML
- [ ] Create Firebase project
- [ ] Design Firestore collections
- [ ] Set up Firebase Auth

### Medium Term (Implementation)
- [ ] Migrate data to Firestore
- [ ] Update frontend modules
- [ ] Create Cloud Functions
- [ ] Test thoroughly

### Long Term (Optimization)
- [ ] Monitor costs
- [ ] Optimize performance
- [ ] Add advanced features
- [ ] Scale as needed

---

## Contact & Support

This application is for NYU's AI in Education VIP team. For questions about:
- **Feature requests:** Create GitHub issue
- **Bugs:** Create GitHub issue
- **Firebase migration:** Refer to migration documentation

---

## Summary

**AIEVIPWritingExchange** is a well-structured, functional web application that's ready for Firebase migration. The codebase is clean, well-organized, and designed to be maintainable. The main challenge is moving from embedded HTML data to a proper database (Firestore), which will enable dynamic content management, user tracking, and chat history persistence.

The three documentation files provide:
- **CODEBASE_ANALYSIS.md:** Complete technical reference
- **ARCHITECTURE_DIAGRAMS.md:** Visual system design
- **QUICK_REFERENCE.md:** Quick lookup for specific needs

All source files are in `/Users/alexanderlandfair/Desktop/Projects/AIEFirebase/AIEVIPWritingExchange/`

Good luck with the Firebase migration!

