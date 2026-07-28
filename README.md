<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="">
    <img alt="ThinkRoom AI" src="" width="120" height="120" style="border-radius: 24px;">
  </picture>

  <h1 align="center">ThinkRoom AI</h1>

  <p align="center">
    <strong>AI-Native Collaborative Workspace</strong>
    <br />
    Real-time chat rooms · AI-powered task extraction · Intelligent summaries · Knowledge management
  </p>

  <p align="center">
    <a href="#features"><strong>Explore the docs »</strong></a>
    ·
    <a href="#demo"><strong>View Demo »</strong></a>
  </p>

  <br />

  <p align="center">
    <a href="https://github.com/yourusername/thinkroom-ai/blob/main/LICENSE">
      <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT" />
    </a>
    <a href="https://nextjs.org/">
      <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16" />
    </a>
    <a href="https://react.dev/">
      <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React 19" />
    </a>
    <a href="https://www.typescriptlang.org/">
      <img src="https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript" alt="TypeScript" />
    </a>
    <a href="https://expressjs.com/">
      <img src="https://img.shields.io/badge/Express-4.19-000000?logo=express" alt="Express" />
    </a>
    <a href="https://socket.io/">
      <img src="https://img.shields.io/badge/Socket.IO-4.8-010101?logo=socket.io" alt="Socket.IO" />
    </a>
    <a href="https://supabase.com/">
      <img src="https://img.shields.io/badge/Supabase-2.39-3FCF8E?logo=supabase" alt="Supabase" />
    </a>
    <a href="https://groq.com/">
      <img src="https://img.shields.io/badge/Groq-Llama%203.3-8B5CF6?logo=groq" alt="Groq" />
    </a>
    <a href="https://tailwindcss.com/">
      <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss" alt="Tailwind CSS" />
    </a>
    <a href="https://zustand-demo.pmnd.rs/">
      <img src="https://img.shields.io/badge/Zustand-5-433E38?logo=react" alt="Zustand" />
    </a>
    <img src="https://img.shields.io/badge/status-active-success.svg" alt="Status: Active" />
  </p>
</div>

<br />

<details open>
  <summary><strong>📖 Table of Contents</strong></summary>

- [Overview](#overview)
- [Demo](#demo)
- [Screenshots](#screenshots)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Application Flow](#application-flow)
- [Folder Structure](#folder-structure)
- [Database](#database)
- [Authentication](#authentication)
- [Realtime System](#realtime-system)
- [AI Pipeline](#ai-pipeline)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Deployment](#deployment)
- [Design System](#design-system)
- [Performance](#performance)
- [Accessibility](#accessibility)
- [Security](#security)
- [Future Roadmap](#future-roadmap)
- [Contributing](#contributing)
- [License](#license)

</details>

---

## Overview

**ThinkRoom AI** is an open-source, AI-native collaborative workspace that transforms the way teams chat, capture knowledge, and manage work. It combines real-time chat rooms with an intelligent background AI that silently listens to conversations, extracts actionable tasks, captures notes and insights, generates documentation, and keeps everyone in sync.

### Why It Exists

Teams in fast-moving environments — whether building startups, managing disasters, or coordinating projects — lose critical information in the noise of endless chat messages. Decisions go undocumented, tasks slip through cracks, and new members spend hours catching up.

ThinkRoom AI solves this by running a **passive AI extraction engine** alongside every conversation. As you chat, the AI:
- Detects action items and assigns tasks
- Captures decisions, risks, ideas, and observations
- Generates meeting summaries and catch-up briefs
- Maintains a rolling summary of what's been discussed

### Target Users

- **Software development teams** — real-time collaboration with AI-powered task management
- **Project managers** — auto-generated summaries, decisions, and tracking
- **Remote teams** — async-friendly with catch-up summaries for late joiners
- **Disaster response coordinators** — Resource Board for needs and offers
- **Anyone who wants AI to do the note-taking**

---

## Demo

> 🚀 **Live Demo**: [thinkroom-ai.vercel.app](https://thinkroom-ai.vercel.app) _(coming soon)_

> 📦 **GitHub Repository**: [github.com/yourusername/thinkroom-ai](https://github.com/yourusername/thinkroom-ai)

---

## Screenshots

<div align="center">
  <table>
    <tr>
      <td align="center">
        <strong>✨ Landing Page — Hero</strong><br />
        <img src="/screenshots/landing-hero.png" alt="Landing Page Hero" width="400" />
        <br /><sub>Premium landing with auth and feature showcase</sub>
      </td>
      <td align="center">
        <strong>✨ Landing Page — Full</strong><br />
        <img src="/screenshots/landing-fullpage.png" alt="Landing Page Full" width="400" />
        <br /><sub>Complete landing page with all sections</sub>
      </td>
    </tr>
    <tr>
      <td align="center">
        <strong>🚀 Landing — Features</strong><br />
        <img src="/screenshots/landing-features.png" alt="Landing Features" width="400" />
        <br /><sub>Feature grid showcasing capabilities</sub>
      </td>
      <td align="center">
        <strong>🔄 Landing — How It Works</strong><br />
        <img src="/screenshots/landing-how-it-works.png" alt="Landing How It Works" width="400" />
        <br /><sub>Step-by-step workflow explanation</sub>
      </td>
    </tr>
    <tr>
      <td align="center">
        <strong>📱 Mobile View — Hero</strong><br />
        <img src="/screenshots/mobile-landing-hero.png" alt="Mobile Landing Hero" width="200" />
        <br /><sub>Responsive mobile landing page</sub>
      </td>
      <td align="center">
        <strong>📱 Mobile View — Full</strong><br />
        <img src="/screenshots/mobile-landing-full.png" alt="Mobile Landing Full" width="200" />
        <br /><sub>Full mobile page</sub>
      </td>
    </tr>
  </table>
</div>

---

## Features

### 🤖 AI Features

| Feature | Description |
|---------|-------------|
| **Task Extraction** | Automatically detects action items, commitments, and requests from chat. Extracts title, assignee, priority, deadline, and confidence score. |
| **Note Capture** | Identifies and categorizes observations, risks, ideas, reminders, resources, and conclusions from conversations. |
| **Document Generation** | Creates structured documents when meaningful discussions occur — architecture decisions, meeting summaries, requirements, technical specs. |
| **Rolling Summary** | Maintains an evolving summary of each room's conversation, updated with every burst of messages. |
| **Meeting Summaries** | On-demand generation of comprehensive meeting summaries with highlights and participant lists. |
| **Daily Summaries** | Generates end-of-day progress reports showing what was accomplished. |
| **Catch-Up ("While You Were Away")** | Late joiners can request a summary of what they missed. |
| **Deduplication** | AI prevents duplicate tasks, notes, and documents using content normalization and time-based checks. |
| **Confidence Scoring** | Every extracted item includes a confidence score (0.0–1.0). Items below thresholds are filtered out. |

### 🧠 AI Personas

@-mention specialized AI experts for focused assistance:

| Persona | Tag | Expertise |
|---------|-----|-----------|
| **Senior Architect** | `@senior_dev` | Code review, scalability, design patterns |
| **Lead Designer** | `@designer` | UI/UX, design systems, aesthetics |
| **Cybersec Engineer** | `@security` | Vulnerability analysis, OWASP Top 10 |
| **Product Manager** | `@pm` | Feature prioritization, roadmaps, MVP |
| **Friendly Mentor** | `@mentor` | Teaching, explanations, deep learning |
| **Root-Cause Analyst** | `@debugger` | Debugging, error investigation |
| **ThinkRoom AI** | `@ai` | General collaboration assistant |

All personas support **real-time streaming** responses via Socket.IO.

### 💬 Collaboration

- **Real-time chat rooms** — create/join rooms with a simple ID
- **Typing indicators** — client-side debounced emission via Socket.IO
- **Message statuses** — sending, sent, delivered, failed, pending
- **Streaming AI responses** — see AI think in real-time
- **WebRTC signaling** — voice/video call signaling infrastructure
- **"New Messages" indicator** — smart scroll behavior

### 🏗️ Workspace

- **AI Workspace panel** — slide-in panel with Tasks, Notes, and Documents tabs
- **Task management** — status updates, editing, archiving, trash, permanent delete
- **Document browser** — expandable cards with highlights, participants, and full content
- **Notes section** — filterable by type (Reminder, Idea, Risk, Observation, etc.) and status
- **Trash & Archive** — soft-delete with restore, permanent delete with confirmation, archive/unarchive
- **Activity logging** — task_activity table tracks all mutations

### 🔐 Authentication

- **Supabase Auth** — OAuth (Google) and Email/Password authentication
- **JWT-based** — Bearer tokens for API requests
- **Role-based access** — user, moderator, admin hierarchy
- **Server-side guard** — Next.js middleware protects `/chat` and `/resources`
- **Socket.IO auth** — token verification on socket connections
- **Mock development token** — bypass auth in dev mode

### ⚡ Realtime Sync

- **Socket.IO** — WebSocket with polling fallback
- **Room-based** — users join/leave rooms, scoped broadcasting
- **Event-driven** — dedicated events for tasks, documents, notes, summaries, AI status
- **Delivery acknowledgements** — message delivery receipts
- **Auto-reconnect** — 10 reconnection attempts with exponential backoff

### 📚 Knowledge Extraction

- **Background AI Worker** — debounced (10s), non-blocking processing queue
- **AbortController support** — cancels in-flight requests on new messages
- **Conversation windowing** — processes last 20 messages for context
- **JSON response parsing** — robust Groq JSON extraction with markdown cleanup
- **Rolling summary** — persists per-room summary in the `summaries` table

### 📋 Tasks

- **Auto-extracted** — AI detects tasks from natural conversation
- **Priority levels** — low, medium, high, urgent
- **Assignees** — display-name based (not FK, avoiding constraint violations)
- **Status workflow** — pending → in_progress → completed
- **Deadline tracking** — parsed from conversation with human-readable display
- **CRUD operations** — create, update, soft-delete, hard-delete, restore, archive
- **Optimistic updates** — UI updates before server confirms

### 📝 Notes

- **10 note types** — Reminder, Idea, Risk, Observation, Resource, Decision, Insight, Architecture, Action Item, Conclusion
- **Color-coded** — each type has a distinct accent color
- **Confidence filtering** — only high-confidence notes are extracted
- **Duplicate detection** — content normalization prevents duplicates

### 📄 Documents

- **10 categories** — Decision, Meeting Summary, Catch Up Summary, Architecture, Brainstorm, Research, Requirements, Sprint Summary, Design Notes, General Documentation
- **Status workflow** — draft, updating, waiting, final, archived
- **Rich metadata** — participants, source message references, confidence
- **Summary generation** — AI-generated executive summaries

### 📊 Resource Board

- **Disaster-relief board** — post needs and offers
- **Categories** — Food, Water, Medicine, Shelter, Other
- **Filtering** — All / Need / Offer toggles

---

## Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Frontend** | [Next.js 16](https://nextjs.org/) | React framework with SSR and API proxying |
| **Frontend** | [React 19](https://react.dev/) | UI library |
| **Frontend** | [TypeScript](https://www.typescriptlang.org/) | Type safety |
| **Backend** | [Express.js 4.19](https://expressjs.com/) | HTTP server |
| **Backend** | [TypeScript](https://www.typescriptlang.org/) | Server-side type safety |
| **Database** | [PostgreSQL](https://www.postgresql.org/) via [Supabase](https://supabase.com/) | Primary data store |
| **Realtime** | [Socket.IO 4.8](https://socket.io/) | WebSocket + polling real-time communication |
| **Authentication** | [Supabase Auth](https://supabase.com/auth) | OAuth (Google) + Email/Password + JWT |
| **AI / LLM** | [Groq SDK](https://groq.com/) | Llama 3.3-70B via Groq Cloud |
| **AI / LLM** | [OpenAI SDK](https://github.com/openai/openai-node) | Installed (available for future use) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) | Utility-first CSS |
| **Styling** | [PostCSS](https://postcss.org/) | CSS processing |
| **Animations** | [Framer Motion 12](https://www.framer.com/motion/) | Motion and animation library |
| **State Management** | [Zustand 5](https://github.com/pmndrs/zustand) | Lightweight state management |
| **Icons** | [Lucide React](https://lucide.dev/) | Icon library |
| **Markdown** | [react-markdown](https://github.com/remarkjs/react-markdown) | AI message rendering |
| **Code Highlighting** | [highlight.js](https://highlightjs.org/) + [rehype-highlight](https://github.com/rehypejs/rehype-highlight) | Syntax highlighting |
| **Markdown Extras** | [remark-gfm](https://github.com/remarkjs/remark-gfm) | GitHub Flavored Markdown |
| **Virtualization** | [react-window](https://github.com/bvaughn/react-window) | Virtualized message list |
| **Offline DB** | [idb](https://github.com/jakearchibald/idb) | IndexedDB wrapper for offline support |
| **Validation** | [Zod 4](https://zod.dev/) | Request validation |
| **Security** | [Helmet](https://helmetjs.github.io/) | HTTP security headers |
| **Security** | [CORS](https://github.com/expressjs/cors) | Cross-origin requests |
| **Compression** | [Compression](https://github.com/expressjs/compression) | Gzip/brotli response compression |
| **Logging** | [Pino](https://getpino.io/) + [pino-http](https://github.com/pinojs/pino-http) | Structured HTTP logging |
| **Font** | [Inter](https://rsms.me/inter/) via Next.js font | Primary typeface |
| **Package Manager** | [pnpm](https://pnpm.io/) | Fast, disk-efficient package manager |
| **Linting** | [ESLint 9](https://eslint.org/) + TypeScript ESLint | Code quality |
| **Linting** | `eslint-plugin-react` + `eslint-plugin-react-hooks` | React-specific rules |

---

## Architecture

```mermaid
graph TB
    subgraph "🌐 Client (Browser)"
        A[Next.js App]
        B[Socket.IO Client]
        C[Zustand Store]
        D[Service Worker PWA]
    end

    subgraph "📡 Next.js Proxy (next.config.js)"
        E[Proxy /api/* → Backend:5000]
        F[Proxy /socket.io/* → Backend:5000]
    end

    subgraph "🖥️ Backend (Express + Socket.IO)"
        G[Express HTTP Server]
        H[Socket.IO Server]
        I[Auth Middleware]
        J[AI Worker Pipeline]
        K[Conversation Buffer]
        L[Memory Service]
        M[Summary Builder]
    end

    subgraph "🗄️ Database"
        N[(PostgreSQL via Supabase)]
    end

    subgraph "🤖 AI"
        O[Groq Cloud API<br/>Llama 3.3-70B]
    end

    subgraph "🔐 Auth Provider"
        P[Supabase Auth]
    end

    A -- OAuth / JWT --> P
    A -- REST API --> E
    A -- WebSocket --> F
    B -- WebSocket events --> H
    F --> G
    E --> G
    G -- CRUD --> N
    H -- Auth --> I
    I -- Validate token --> P
    H -- Enqueue message --> J
    J -- Fetch context --> N
    J -- Process --> O
    J -- Store results --> N
    J -- Emit events --> H
    K -- Buffer messages --> J
    L -- Build room memory --> N
    M -- Generate summaries --> O
    M -- Store documents --> N
    H -- Broadcast events --> B
    C -- Updates UI --> A
    D -- Cache static assets --> A
```

### Architecture Stages

1. **Client** — Next.js app renders the UI. Socket.IO client maintains persistent connections. Zustand stores manage application state. A service worker enables PWA capabilities.

2. **Proxy Layer** — Next.js rewrites proxy `/api/*` and `/socket.io/*` requests to the Express backend, avoiding CORS issues in production.

3. **Backend** — Express serves the REST API. Socket.IO manages WebSocket connections. The auth middleware validates Supabase JWT tokens for both HTTP and WebSocket requests.

4. **AI Pipeline** — Background workers process messages through Groq's Llama 3.3-70B model. The pipeline is debounced (10s), cancellable (AbortController), and runs asynchronously without blocking chat.

5. **Database** — PostgreSQL via Supabase stores all data. Row Level Security protects direct client access. Realtime publication enables database-level change events.

6. **AI Provider** — Groq Cloud provides low-latency inference for Llama 3.3-70B, with exponential backoff retry for rate limits and timeouts.

---

## Application Flow

```mermaid
sequenceDiagram
    participant User as 👤 User
    participant UI as 🖥️ React UI
    participant S as 🔌 Socket.IO
    participant API as 🌐 Express API
    participant DB as 🗄️ PostgreSQL
    participant AI as 🤖 Groq AI

    User->>UI: Types message
    UI->>API: POST /api/messages (JWT)
    API->>DB: INSERT message
    API-->>UI: 201 { message data }
    UI->>S: emit("send_message", { roomId, message })
    S->>UI: emit("receive_message", message)
    S->>S: Enqueue for AI processing (10s debounce)

    Note over S,AI: AI Pipeline (debounced background)

    S->>AI: Fetch last 20 messages + rolling summary
    AI->>AI: Compile Groq prompt
    AI->>AI: Call Llama 3.3-70B (JSON mode)
    AI-->>S: Parsed JSON response

    S->>DB: Upsert rolling summary
    S->>DB: Insert tasks (with dedup check)
    S->>DB: Insert notes (with dedup check)
    S->>DB: Insert documents (with dedup check)

    S->>UI: emit("summary_updated")
    S->>UI: emit("task_created")
    S->>UI: emit("note_created")
    S->>UI: emit("document_created")

    UI->>UI: Update Zustand store
    UI->>UI: Show notification chip
    User->>UI: Clicks notification → opens workspace
```

### Flow Explanation

1. **Message Creation** — User types a message. It's sent as a REST POST to the API, which saves it to PostgreSQL and returns the persisted message.

2. **Real-time Broadcast** — The message is emitted via Socket.IO to all room members, including the sender (for delivery confirmation).

3. **Background AI Processing** — The AI Worker enqueues the message with a 10-second debounce. New messages cancel any pending timers and abort in-flight AI requests.

4. **AI Analysis** — After the debounce window, the worker fetches the last 20 messages and the rolling summary, compiles a structured prompt, and sends it to Groq.

5. **Knowledge Extraction** — Groq returns JSON containing tasks, notes, documents, and an updated summary. The parser validates and normalizes the response.

6. **Deduplication** — Each extracted item is checked against existing data to prevent duplicates. Tasks are compared by title, notes by normalized content, documents by title within a time window.

7. **Persistence & Broadcast** — New items are saved to PostgreSQL and broadcast to the room via Socket.IO events. The Zustand store updates the UI.

8. **User Notification** — A floating chip appears to notify users of new AI-detected items.

---

## Folder Structure

```
thinkroom-ai/
├── public/                          # Static assets
│   ├── manifest.json                # PWA manifest
│   ├── service-worker.js            # Service Worker (Network First)
│   └── icon-{192,512}.png           # PWA icons
│
├── src/                             # Frontend (Next.js)
│   ├── api/                         # API client functions
│   │   └── messagesApi.ts           # Message fetch/send API
│   ├── app/                         # Next.js App Router
│   │   ├── auth/callback/route.ts   # OAuth callback handler
│   │   ├── chat/page.tsx            # Chat workspace route
│   │   ├── resources/page.tsx       # Resource board route
│   │   ├── actions.ts               # Server actions (logout)
│   │   ├── error.tsx                # Error boundary page
│   │   ├── globals.css              # Global CSS entry
│   │   ├── layout.tsx               # Root layout w/ SupabaseProvider
│   │   ├── loading.tsx              # Loading state
│   │   ├── not-found.tsx            # 404 page
│   │   └── page.tsx                 # Landing page (auth gate)
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatInput.tsx        # Composer with auto-resize & typing
│   │   │   └── MessageList.tsx      # Virtualized message list
│   │   ├── landing/                 # Landing page components
│   │   │   ├── ProductionLandingPage.tsx
│   │   │   ├── effects/CustomCursor.tsx
│   │   │   ├── hooks/useScrollSpy.ts
│   │   │   └── sections/           # Navbar, Hero, Features, FAQ, etc.
│   │   ├── tasks/
│   │   │   ├── AITaskWorkspace.jsx  # Root AI workspace w/ panel + chip
│   │   │   ├── NotesSection.jsx     # Notes tab with filtering
│   │   │   ├── TaskCard.jsx         # Individual task card
│   │   │   ├── TaskColumn.jsx       # Task column (by status)
│   │   │   ├── TaskSidebar.jsx      # Legacy task sidebar
│   │   │   └── WorkspaceToggleButton.jsx
│   │   ├── AnimatedBackground.jsx   # Ambient background orbs
│   │   ├── ChatPage.jsx             # Main chat page component
│   │   ├── ErrorBoundary.tsx        # React error boundary
│   │   ├── MarkdownRenderer.jsx     # Markdown + syntax highlighting
│   │   ├── MessageBubble.jsx        # Message rendering w/ status icons
│   │   ├── NetworkBar.jsx           # Network status bar
│   │   ├── NetworkStatus.jsx        # Network status pill
│   │   ├── ResourceBoard.jsx        # Disaster-relief resource board
│   │   ├── RoomSidebar.jsx          # Room list sidebar
│   │   └── SupabaseProvider.tsx     # Auth context provider
│   ├── hooks/
│   │   ├── useNetworkHealth.ts      # Network health polling
│   │   ├── useOnlineStatus.ts       # Online/offline detection
│   │   └── useResources.ts          # IndexedDB resource hooks
│   ├── lib/
│   │   ├── supabase-server.ts       # Server-side Supabase client
│   │   └── supabase.ts              # Browser Supabase client
│   ├── store/
│   │   ├── chatStore.ts             # Chat + streaming state (Zustand)
│   │   └── taskStore.ts             # Tasks, docs, notes state (Zustand)
│   ├── types/
│   │   ├── models.ts                # User, Task, Document, Note, Message, Decision
│   │   └── socket.ts                # Socket.IO event type definitions
│   ├── utils/
│   │   ├── logger.ts                # Frontend logger utility
│   │   └── offlineSync.ts           # Offline message queue (localStorage)
│   ├── AnimatedBackground.css
│   ├── App.css                      # Main workspace design system
│   ├── apiConfig.ts                 # API & Socket URL configuration
│   ├── db.ts                        # IndexedDB init (idb)
│   ├── LandingPage.css
│   └── middleware.ts                # Next.js auth guard middleware
│
├── server/                          # Backend (Express + Socket.IO)
│   ├── ai/                          # AI persona routing
│   │   ├── groqService.ts           # Persona streaming service
│   │   ├── personas.ts              # AI persona definitions (7 personas)
│   │   └── router.ts                # @mention detection router
│   ├── config/
│   │   ├── db.ts                    # PostgreSQL connection + schema init
│   │   └── env.ts                   # Environment variable validation
│   ├── controllers/
│   │   ├── aiController.ts          # @ai mention handler
│   │   ├── messageController.ts     # Message CRUD + AI enqueue
│   │   ├── resourceController.ts    # Resource CRUD
│   │   ├── socketController.ts      # All Socket.IO event handlers
│   │   └── userController.ts        # User sync handler
│   ├── middleware/
│   │   ├── errorHandler.ts          # Express error handler
│   │   ├── logger.ts                # Pino HTTP logger
│   │   ├── security.ts             # Helmet + Compression
│   │   └── validate.ts              # Zod request validation
│   ├── repositories/
│   │   └── BaseRepository.ts        # Base DB repository pattern
│   ├── routes/
│   │   ├── messageRoutes.ts         # /api/messages routes
│   │   └── resourceRoutes.ts        # /api/resources routes
│   ├── services/
│   │   ├── ai/
│   │   │   ├── AIWorker.ts          # Background AI extraction pipeline
│   │   │   ├── ConversationBuffer.ts # In-memory message window
│   │   │   ├── GroqJsonParser.ts     # JSON response parser
│   │   │   └── GroqPromptManager.ts  # Prompt template compiler
│   │   ├── auth/
│   │   │   ├── auth.service.ts      # JWT verification + RBAC middleware
│   │   │   ├── permissions.service.ts # Role hierarchy
│   │   │   └── userSync.service.ts   # User profile sync
│   │   ├── documents/
│   │   │   └── DocumentService.ts   # Document CRUD + dedup
│   │   ├── memory/
│   │   │   ├── MemoryBuilder.ts     # Room memory context builder
│   │   │   ├── MemoryCache.ts       # In-memory LRU cache
│   │   │   └── MemoryService.ts     # Memory orchestrator
│   │   ├── notes/
│   │   │   └── NotesService.ts      # Notes CRUD + dedup
│   │   ├── summary/
│   │   │   └── SummaryBuilder.ts    # Meeting/daily/catch-up summaries
│   │   └── tasks/
│   │       └── TaskService.ts       # Tasks CRUD + activity logging
│   ├── utils/
│   │   ├── groqClient.ts            # Groq client + retry logic
│   │   └── logger.ts                # Backend logger utility
│   └── index.ts                     # Server entry point
│
├── supabase/
│   └── migrations/
│       ├── 0001_init.sql            # Full schema + triggers + RLS + realtime
│       └── 0002_add_summaries.sql   # Summaries table migration
│
├── next.config.js                   # Next.js config with API/Socket proxy
├── package.json                     # Frontend dependencies
├── server/package.json              # Backend dependencies
├── tsconfig.json                    # Frontend TypeScript config
├── server/tsconfig.json             # Backend TypeScript config
├── eslint.config.js                 # ESLint flat config
├── postcss.config.mjs               # PostCSS with Tailwind
└── pnpm-workspace.yaml              # pnpm workspace config
```

### Key Folder Purposes

| Directory | Purpose |
|-----------|---------|
| `src/app/` | Next.js App Router pages, API routes, layouts, and middleware |
| `src/components/` | All React components — chat, landing, tasks, shared |
| `src/store/` | Zustand state management for chat and workspace data |
| `src/hooks/` | Custom React hooks for network, resources, and more |
| `src/utils/` | Frontend utilities — logging, offline sync |
| `src/types/` | TypeScript type definitions and Socket.IO event types |
| `server/controllers/` | Express route handlers for messages, resources, users |
| `server/services/` | Core business logic — AI pipeline, auth, memory, summaries |
| `server/ai/` | AI persona definitions, routing, and streaming |
| `server/middleware/` | Express middleware — auth, security, validation, error handling |
| `server/routes/` | Express route definitions |
| `server/config/` | Database and environment configuration |
| `server/utils/` | Groq client with retry, backend logger |
| `supabase/migrations/` | Database schema migrations (idempotent) |

---

## Database

ThinkRoom AI uses **PostgreSQL via Supabase** with 9 tables. All migrations are idempotent and safe to re-run.

### Entity Relationship

```mermaid
erDiagram
    users ||--o{ messages : "sender"
    users ||--o{ task_assignments : "assigned"
    users ||--o{ task_assignments : "assigned_by"
    messages ||--o{ tasks : "source"
    tasks ||--o{ task_activity : "activity"
    tasks ||--o{ task_assignments : "assignments"

    users {
        uuid id PK "References auth.users(id)"
        text email
        text full_name
        text name "Legacy display name"
        text avatar_url
        text role "user | moderator | admin"
        timestamptz created_at
        timestamptz updated_at
    }

    messages {
        uuid id PK
        text text "Message content"
        uuid sender_id FK "References users(id), nullable"
        text sender_name "Display name"
        text room_id "Room identifier"
        timestamptz created_at
    }

    resources {
        serial id PK
        text type "need | offer"
        text category
        text description
        timestamptz created_at
    }

    tasks {
        uuid id PK
        text room_id
        uuid source_message_id FK
        text title
        text description
        text assigned_to_name "Display name, not FK"
        text priority "low | medium | high | urgent"
        text status "pending | in_progress | completed | cancelled"
        timestamptz deadline
        float confidence
        boolean ai_generated
        text created_by
        boolean is_deleted
        timestamptz deleted_at
        boolean is_archived
        timestamptz created_at
        timestamptz updated_at
    }

    task_activity {
        uuid id PK
        uuid task_id FK
        text activity_type
        text actor_id
        jsonb metadata
        timestamptz created_at
    }

    task_assignments {
        uuid id PK
        uuid task_id FK
        uuid user_id FK
        uuid assigned_by FK
        timestamptz created_at
        unique(task_id, user_id)
    }

    documents {
        uuid id PK
        text room_id
        text category "10 categories incl. Decision, Meeting Summary"
        text title
        text status "draft | updating | waiting | final | archived"
        text summary
        text content
        jsonb participants
        jsonb source_messages
        float confidence
        text created_by
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
        boolean archived
    }

    notes {
        uuid id PK
        text room_id
        text type "10 types incl. Reminder, Idea, Risk"
        text title
        text content
        float confidence
        text created_by
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
        timestamptz archived_at
    }

    summaries {
        text room_id PK
        text content
        float confidence
        timestamptz created_at
        timestamptz updated_at
    }
```

### Tables Overview

| Table | Purpose | Key Constraints |
|-------|---------|-----------------|
| `users` | Mirrors Supabase Auth identities | PK = UUID linked to `auth.users(id)`. Role must be `user`, `moderator`, or `admin`. |
| `messages` | Chat messages | `sender_id` nullable FK to `users(id)`. `created_at` indexed. |
| `resources` | Disaster-relief needs/offers | `type` must be `need` or `offer`. |
| `tasks` | AI-extracted tasks | `status`, `priority` constrained. `ai_generated` flag. `is_deleted` + `is_archived` for soft deletes. |
| `task_activity` | Task mutation audit log | FK cascade on delete. Stores `activity_type` and `metadata` JSONB. |
| `task_assignments` | User-task assignments | Composite UNIQUE on `(task_id, user_id)`. FKs to `users`. |
| `documents` | AI-generated documents (also stores summaries/decisions via `category`) | 10 constrained categories. `status` workflow. `participants` and `source_messages` as JSONB. |
| `notes` | AI-captured notes | 10 constrained types. `deleted_at` and `archived_at` for lifecycle. |
| `summaries` | Rolling conversation summaries | PK is `room_id` TEXT. Upsert pattern. |

### Key Design Decisions

- **`assigned_to_name` is TEXT, not FK** — tasks store display names as plain text, avoiding foreign key violations when AI assigns tasks to names not in the users table
- **`created_by` / `actor_id` are TEXT** — may contain sentinel values like `AI_SYSTEM` or `SYSTEM`, not actual user IDs
- **RLS is enabled** but the backend connects with the `postgres` role (BYPASSRLS), so API operations are never blocked
- **Realtime publication** — messages, tasks, notes, and documents are registered on `supabase_realtime` with `REPLICA IDENTITY FULL`
- **Auto-sync triggers** — `auth.users` INSERT/UPDATE triggers automatically sync to `public.users`

---

## Authentication

ThinkRoom AI uses **Supabase Auth** for identity management with a multi-layered security approach.

### Auth Flow

```mermaid
sequenceDiagram
    participant User as 👤 User
    participant UI as 🖥️ React
    participant N as 🌐 Next.js
    participant S as 🔌 Supabase Auth
    participant API as 🖥️ Express
    participant DB as 🗄️ PostgreSQL

    User->>UI: Clicks "Sign in with Google"
    UI->>S: supabase.auth.signInWithOAuth({ provider: "google" })
    S->>User: OAuth redirect to Google
    User->>S: Authenticate
    S->>N: Redirect to /auth/callback?code=xxx
    N->>S: exchangeCodeForSession(code)
    S-->>N: Set httpOnly session cookie
    N->>UI: Redirect to /chat

    User->>API: POST /api/messages (Authorization: Bearer JWT)
    API->>S: supabase.auth.getUser(token)
    S-->>API: { user }
    API->>API: Attach user to req.user
    API->>DB: Execute query (postgres role bypass RLS)
    API-->>User: 200 { data }

    User->>S: Socket.IO connect (auth: { token })
    S->>S: AuthService.verifySocketToken(token)
    S-->>User: Socket connected (or error)
```

### Implemented Security Layers

1. **Next.js Middleware** — Server-side guard at `/middleware.ts` checks `supabase.auth.getUser()` for every request to `/chat` and `/resources`. Unauthenticated users are redirected to `/`.

2. **Express Auth Middleware** — `AuthService.requireAuth` validates Bearer JWT tokens against Supabase for all API routes (messages, resources, user sync).

3. **Socket.IO Auth** — `AuthService.verifySocketToken` validates tokens on connection. Supports a `mock-development-token` for local development.

4. **Role-Based Access Control** — `PermissionsService` implements a three-tier hierarchy: `user` < `moderator` < `admin`. The `requireRole` middleware can be applied to restrict access to specific endpoints.

5. **User Sync** — On login, the client calls `POST /api/users/sync` to upsert the user profile. Supabase triggers also auto-sync `auth.users` → `public.users`.

---

## Realtime System

ThinkRoom AI uses **Socket.IO** (WebSocket with polling fallback) for all real-time communication.

### Connection Architecture

```
Client Browser                   Express Server
┌─────────────┐                 ┌──────────────┐
│ Socket.IO   │──connect()─────▶│ Socket.IO    │
│ Client      │                 │ Server        │
│             │◀──auth verify──│ (io.use)      │
│             │                 │              │
│             │──join-room─────▶│ join room    │
│             │◀──peer-joined──│ broadcast    │
│             │                 │              │
│             │──send_message──▶│ 1. Broadcast │
│             │◀──receive_msg──│ 2. Enqueue AI│
│             │                 │              │
│             │◀──task_created──│ AI extracted │
│             │◀──note_created──│ knowledge    │
│             │◀──doc_created───│              │
└─────────────┘                 └──────────────┘
```

### Socket Events — Server to Client

| Event | Payload | Description |
|-------|---------|-------------|
| `receive_message` | `{ id, text, sender_name, room_id, created_at, ... }` | New chat message |
| `peer-joined` | `{ roomId }` | Another user joined the room |
| `ai_stream_start` | `{ messageId, sender, personaId, color }` | AI persona started streaming |
| `ai_stream_chunk` | `{ messageId, chunk }` | Streaming AI response chunk |
| `ai_stream_end` | `{ messageId, finalDbId, text, created_at }` | AI streaming complete |
| `message-delivered` | `{ clientId }` | Message delivery confirmation |
| `summary_updated` | `{ roomId, summary, messageId, timestamp }` | Rolling summary updated |
| `task_created` | Task object with id, roomId, title, status, priority, etc. | New AI task |
| `task_updated` | Task object (updated) | Task status/detail change |
| `task_deleted` | `{ taskId }` | Task hard-deleted |
| `document_created` | Document object | New AI document |
| `document_updated` | Document object (updated) | Document change |
| `document_deleted` | `{ docId }` | Document hard-deleted |
| `note_created` | Note object | New AI note |
| `note_updated` | Note object (updated) | Note change |
| `note_deleted` | `{ noteId }` | Note hard-deleted |
| `summary_generation_status` | `{ status, type }` | Summary generation progress |
| `task_generation_status` | `{ status }` | AI pipeline progress |
| `offer` / `answer` / `ice-candidate` | WebRTC signaling payloads | Voice/video call signaling |

### Socket Events — Client to Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join-room` | `roomId: string` | Join a chat room |
| `leave-room` | `roomId: string` | Leave a chat room |
| `send_message` | `{ roomId, message: { id, text, sender_name, ... } }` | Send a chat message |
| `message-delivered` | `{ clientId, senderSocketId }` | Acknowledge delivery |
| `get_tasks` | `{ roomId }` | Fetch all tasks for room |
| `update_task_status` | `{ taskId, status, roomId, actorId }` | Update task status |
| `update_task` | `{ taskId, title, description, roomId }` | Update task details |
| `soft_delete_task` | `{ taskId, roomId, actorId }` | Soft delete task |
| `restore_task` | `{ taskId, roomId, actorId }` | Restore deleted task |
| `hard_delete_task` | `{ taskId, roomId }` | Permanently delete task |
| `toggle_archive_task` | `{ taskId, isArchived, roomId, actorId }` | Toggle archive |
| `get_documents` | `{ roomId }` | Fetch all documents |
| `soft_delete_document` | `{ docId, roomId }` | Soft delete document |
| `restore_document` | `{ docId, roomId }` | Restore document |
| `hard_delete_document` | `{ docId, roomId }` | Permanently delete document |
| `toggle_archive_document` | `{ docId, isArchived, roomId }` | Toggle archive |
| `get_notes` | `{ roomId }` | Fetch all notes |
| `soft_delete_note` | `{ noteId, roomId }` | Soft delete note |
| `restore_note` | `{ noteId, roomId }` | Restore note |
| `hard_delete_note` | `{ noteId, roomId }` | Permanently delete note |
| `toggle_archive_note` | `{ noteId, isArchived, roomId }` | Toggle archive |
| `request_summary` | `{ roomId, summaryType, requestorName }` | Request a summary |
| `offer` / `answer` / `ice-candidate` | WebRTC signaling | Voice/video call |

### Room Management

- Users join rooms by emitting a `join-room` event with a room ID
- On disconnect, users automatically leave all rooms
- On reconnect, the client re-emits `join-room` for the active room
- AI broadcasts are scoped to rooms via `io.to(roomId).emit()`

---

## AI Pipeline

ThinkRoom AI's core intelligence runs as a **background, debounced, non-blocking pipeline** that processes conversations without disrupting the chat experience.

### Pipeline Architecture

```mermaid
graph LR
    subgraph "Input"
        A[New Message]
    end

    subgraph "Debounce (10s)"
        B[Cancel previous timer]
        C[Abort in-flight Groq]
        D[Set new 10s timer]
    end

    subgraph "Extraction"
        E[Fetch last 20 messages]
        F[Fetch rolling summary]
        G[Compile Groq prompt]
        H[Call Llama 3.3-70B]
    end

    subgraph "Parsing"
        I[Clean markdown wrappers]
        J[Parse JSON]
        K[Validate structure]
    end

    subgraph "Persistence"
        L[Upsert summary]
        M[Save tasks w/ dedup]
        N[Save notes w/ dedup]
        O[Save documents w/ dedup]
    end

    subgraph "Broadcast"
        P[Emit socket events]
    end

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    J --> K
    K --> L
    K --> M
    K --> N
    K --> O
    L --> P
    M --> P
    N --> P
    O --> P
```

### Detailed Pipeline Steps

#### 1. Message Enqueue
Every message (from REST API or Socket.IO) calls `AIWorker.enqueueMessage()`. The worker:
- Clears any existing debounce timer for the room
- Aborts any in-flight Groq request via `AbortController`
- Sets a new 10-second timer

#### 2. Context Fetching
When the debounce timer fires, the worker fetches:
- **Last 20 messages** — most recent conversation history for context
- **Rolling summary** — previously generated summary from the `summaries` table

#### 3. Prompt Compilation
`GroqPromptManager.getSystemPrompt()` builds a comprehensive system prompt that instructs the AI to:
- Act as a staff-level technical coordinator and project manager
- Extract tasks (action items, commitments, promises)
- Capture notes (observations, insights, risks, ideas, etc.)
- Generate documents for meaningful discussions
- Update the rolling summary

#### 4. Groq API Call
```typescript
const completion = await groq.chat.completions.create({
  model: "llama-3.3-70b-versatile",
  messages: [systemPrompt, userPrompt],
  temperature: 0.1,        // Low temperature for consistency
  response_format: { type: "json_object" },
  max_tokens: 1500
}, { signal: abortController.signal });
```

The call includes:
- **Timeout** — 20 second timeout enforced by `AbortController`
- **Retry** — exponential backoff (1s, 2s, 4s) up to 3 attempts
- **Rate limit handling** — extracts retry-after from error messages
- **Abortability** — new messages cancel in-flight requests

#### 5. JSON Parsing
`GroqJsonParser.parse()` handles:
- Strips markdown codeblock wrappers (````json)
- Validates and normalizes all fields
- Maps priorities to valid values (`low`/`medium`/`high`/`urgent`)
- Sets default confidence scores
- Returns structured `GroqPayload`

#### 6. Deduplication
Before persisting, each item is checked:
- **Tasks** — matched by `room_id + title + pending status`
- **Notes** — normalized content comparison (lowercase, trim, whitespace)
- **Documents** — matched by `room_id + normalized title` within 10-minute window

#### 7. Persistence & Broadcast
Each item is saved to the database and broadcast via Socket.IO:
- `summary_updated` — rolling summary update
- `task_created` — new task with all metadata
- `note_created` — new note with type and content
- `document_created` — new document with category, summary, content

### AI Persona Streaming

For @-mentioned personas, `processPersonaStream()` provides a **real-time streaming** experience:
1. Fetches room history (last 15 messages) + Memory Engine context
2. Emits `ai_stream_start` to the room
3. Initiates a streaming Groq completion (`stream: true`)
4. Emits `ai_stream_chunk` for each token received
5. Saves the full response to the database
6. Emits `ai_stream_end` with the final message ID

### Summary Generation

The `SummaryBuilder` supports three summary types via the `request_summary` socket event:

| Type | Description | Document Category |
|------|-------------|-------------------|
| `meeting` | Comprehensive meeting summary with highlights | Meeting Summary |
| `daily` | End-of-day progress report | Catch Up Summary |
| `catch_up` | "While You Were Away" for late joiners | Catch Up Summary |

Summaries are generated by:
1. Fetching the message window from `ConversationBuffer`
2. Sending a structured prompt to Groq
3. Parsing the JSON response
4. Checking for recent documents of the same category
5. Updating existing or creating new document
6. Emitting `document_created` socket event

### Memory Engine

The `MemoryService` maintains an **in-memory cache** of room context:

- **Rebuild** — compiles pending tasks, active notes, and active documents into a text index
- **Cache** — stores compiled context with character count (max 8000 chars / ~2000 tokens)
- **Invalidation** — cache is invalidated on any task, note, or document mutation
- **Background rebuild** — mutations trigger non-blocking async rebuilds

---

## API Reference

All API routes are proxied through Next.js at `/api/*` → `http://127.0.0.1:5000/api/*`.

### REST Endpoints

| Method | Endpoint | Auth Required | Purpose | Request Body | Response |
|--------|----------|---------------|---------|-------------|----------|
| `POST` | `/api/messages` | Yes (JWT) | Create a new message | `{ text, sender_id?, sender_name?, room_id?, id? }` | `{ success, data: { id, text, ... } }` |
| `GET` | `/api/messages` | Yes (JWT) | Fetch messages for a room | Query: `roomId` | `{ success, count, data: Message[] }` |
| `POST` | `/api/resources` | Yes (JWT) | Create a resource (need/offer) | `{ type, category, description }` | `{ success, data: Resource }` |
| `GET` | `/api/resources` | Yes (JWT) | Fetch all resources | — | `{ success, count, data: Resource[] }` |
| `POST` | `/api/users/sync` | No | Sync user profile | `{ id, name, email, avatarUrl }` | `{ success, data: User }` |
| `GET` | `/api/memory/:roomId` | No | Get room memory debug info | — | `{ success, contextString, tokenCount, updatedAt }` |
| `GET` | `/api/ping` | No | Health check | — | `{ status: "ok", timestamp }` |
| `GET` | `/` | No | Server status | — | `{ success, message }` |

### Socket.IO Events

See the [Realtime System — Socket Events](#socket-events--server-to-client) section for the complete list of Socket.IO events.

---

## Environment Variables

### Required Variables

| Variable | Purpose | Required | Example |
|----------|---------|----------|---------|
| `SUPABASE_URL` | Supabase project URL | ✅ | `https://your-project.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anonymous API key | ✅ | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `DATABASE_URL` | PostgreSQL connection string (Supabase pooler) | ✅ | `postgresql://postgres:password@db.xxx.supabase.co:6543/postgres` |
| `GROQ_API_KEY` | Groq Cloud API key | ✅ | `gsk_your_groq_api_key` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL (browser-accessible) | ✅ | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (browser-accessible) | ✅ | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### Optional Variables

| Variable | Purpose | Default | Example |
|----------|---------|---------|---------|
| `PORT` | Backend server port | `5000` | `5000` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (for admin operations) | _disabled_ | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `NEXT_PUBLIC_API_URL` | API base URL for frontend | `''` (same origin) | `http://localhost:5000` |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.IO server URL | `http://localhost:5000` | `http://localhost:5000` |
| `NODE_ENV` | Environment mode | _auto_ | `development` / `production` |
| `LOG_LEVEL` | Pino logger level | `info` | `debug` / `info` / `warn` / `error` |

> ⚠️ **Never commit actual secret values.** Use a `.env` file in the `server/` directory for backend variables and a `.env.local` file in the root for frontend variables.

---

## Installation

### Prerequisites

- **Node.js** >= 18
- **pnpm** >= 8 (`npm install -g pnpm`)
- **Supabase project** ([create one free](https://supabase.com/))
- **Groq API key** ([get one free](https://console.groq.com/))

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/thinkroom-ai.git
cd thinkroom-ai

# 2. Install all dependencies (root + server)
pnpm install

# 3. Set up environment variables
# Backend variables (server/.env):
cp server/.env.example server/.env
# Edit server/.env with your Supabase and Groq credentials

# Frontend variables (root .env.local):
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 4. Set up the database
cd supabase
supabase link --project-ref your-project-ref
supabase db push
# Or run the migration SQL manually in Supabase SQL Editor

# 5. Start the backend (from project root)
cd server
pnpm dev
# Server starts on http://localhost:5000

# 6. Start the frontend (from project root, new terminal)
pnpm dev
# App starts on http://localhost:3000
```

### Development

```bash
# Run both frontend and backend concurrently
pnpm dev          # Frontend (port 3000)
cd server && pnpm dev    # Backend (port 5000)

# Type check
pnpm type-check

# Lint
pnpm lint
```

### Production Build

```bash
# Build frontend
pnpm build

# Start production
pnpm start
```

---

## Deployment

### Frontend (Vercel / Next.js)

1. Connect your GitHub repo to Vercel
2. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_URL` (your backend URL)
   - `NEXT_PUBLIC_SOCKET_URL` (your backend URL)
3. Deploy — Vercel auto-detects Next.js

### Backend (Railway / Fly.io / Render)

1. Deploy the `server/` directory as a Node.js service
2. Set all environment variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `DATABASE_URL`, `GROQ_API_KEY`)
3. Expose port `5000` (or your configured `PORT`)
4. Update frontend `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SOCKET_URL` to point to your backend

### Database (Supabase)

1. Create a Supabase project
2. Run migrations from `supabase/migrations/` in the SQL Editor
3. Enable Google Auth in Supabase Dashboard → Authentication → Providers
4. Configure your site URL and redirect URLs in Authentication → Settings

> 💡 **Tip:** The Next.js middleware and proxy in `next.config.js` eliminate CORS issues in production. API calls default to same-origin, while Socket.IO connects directly to the backend URL.

---

## Design System

ThinkRoom AI features a premium dark design system with meticulous attention to detail.

### Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--ds-bg` | `#1E1E22` | Page background |
| `--ds-surface` | `#26262C` | Surface/card backgrounds |
| `--ds-card` | `#303038` | Card surfaces |
| `--ds-card-hover` | `#393942` | Card hover state |
| `--ds-accent` | `#8B5CF6` | Primary accent (purple) |
| `--ds-accent-light` | `#A78BFA` | Light accent |
| `--ds-ai-tint` | `rgba(139, 108, 255, 0.14)` | AI message background |
| `--ds-success` | `#65D6A4` | Success/online states |
| `--ds-warning` | `#F8C15A` | Warning states |
| `--ds-danger` | `#F87171` | Error/danger states |
| `--ds-text` | `#FAFAFA` | Primary text |
| `--ds-text-secondary` | `#C5C5CE` | Secondary text |
| `--ds-text-muted` | `#8A8A94` | Muted text |
| `--ds-border` | `rgba(255, 255, 255, 0.06)` | Subtle borders |
| `--ds-border-medium` | `rgba(255, 255, 255, 0.10)` | Medium borders |

### Typography

- **Primary font:** Inter (variable, weights 400–900)
- **Base size:** 0.88rem (14px) for body text
- **Headings:** 1.05rem–1.4rem with tight letter-spacing
- **UI text:** Smaller sizes (0.55rem–0.75rem) with strong font-weight

### Component Philosophy

- **Glassmorphism** — Command center uses `backdrop-filter: blur(24px)` for a glassy effect
- **Gradients** — Subtle purple gradients for AI elements, brand elements, and buttons
- **Borders** — Ultra-thin (`0.06 opacity`) borders for depth without visual weight
- **Shadows** — Layered shadow system (`--ds-shadow-sm` through `--ds-shadow-xl`)
- **Border radius** — Progressive scale: 10px → 14px → 20px → 24px → full
- **Animations** — All animations use Framer Motion with spring physics (`stiffness: 400, damping: 28`)

### Responsive Behavior

- **Workspace max-width:** 1380px with 18px margin (removes on < 1400px)
- **Conversation padding:** 48px on desktop → 24px on tablet → 10px on mobile
- **Header tablet:** Command center collapses center section, hides info strip
- **Composer:** Full-width with rounded pill design, adapts height

---

## Performance

ThinkRoom AI implements several performance optimizations:

### Frontend

| Optimization | Implementation |
|-------------|----------------|
| **Virtualized message list** | `react-window` with dynamic row heights based on content length |
| **Lazy loading** | AI Workspace panel loaded via `React.lazy()` + `Suspense` |
| **Streaming chunk buffering** | AI response chunks batched at 50ms intervals to reduce re-renders |
| **Memoization** | `React.memo` on MessageBubble, ChatInput, MessageList, TaskCard, all workspace components |
| **Selective Zustand subscriptions** | Components subscribe to specific state slices, not the entire store |
| **Stable selectors** | `useCallback` wrappers prevent selector recreation on re-renders |
| **Message deduplication** | Both `id` and payload-based dedup prevents duplicate messages |
| **Optimistic updates** | Task status changes update the UI instantly before server confirmation |

### Backend

| Optimization | Implementation |
|-------------|----------------|
| **Debounced AI pipeline** | 10-second debounce prevents redundant API calls during rapid messaging |
| **AbortController** | In-flight AI requests cancelled when new messages arrive |
| **Exponential backoff retry** | 1s → 2s → 4s delays with rate-limit-aware wait times |
| **Conversation windowing** | Only last 20 messages sent to AI, not entire history |
| **Content caching** | Room memory context cached in-memory with invalidation on mutations |
| **Connection pooling** | PostgreSQL via `pg.Pool` with connection reuse |
| **Response compression** | Gzip/brotli via `compression` middleware |
| **JSON parsing resilience** | Markdown codeblock stripping before JSON.parse |

---

## Accessibility

> **Note:** Accessibility features are minimal but present in the current implementation.

- **Focus indicators** — `:focus-visible` outlines with accent color and offset
- **Semantic HTML** — Proper heading hierarchy (h1–h4)
- **ARIA attributes** — `aria-hidden` on decorative elements and slide panels
- **Keyboard shortcuts** — `Ctrl + Shift + M` for memory debug panel
- **Color contrast** — Dark theme with high-contrast text (FAFAFA on dark surfaces)
- **Text alternatives** — `title` attributes on icon buttons

---

## Security

| Measure | Implementation |
|---------|---------------|
| **JWT Authentication** | Bearer tokens validated against Supabase Auth for all API and Socket.IO connections |
| **Next.js Middleware** | Server-side route protection for `/chat` and `/resources` |
| **Helmet headers** | HTTP security headers (CSP, X-Frame-Options, etc.) |
| **CORS** | Configurable CORS policy (currently permissive with `origin: true`) |
| **Input validation** | Zod schema validation for request bodies |
| **SQL injection protection** | Parameterized queries via `pg` client |
| **UUID validation** | Source message IDs validated as UUID before FK reference |
| **Rate limit resilience** | Exponential backoff retry with rate-limit detection |
| **Environment variable validation** | Startup validation fails fast for missing/invalid config |
| **RLS enabled** | Row Level Security on all tables (bypassed by backend service role) |
| **Pino HTTP logging** | Structured request logging with sensitive data excluded |

---

## Future Roadmap

These suggestions align with the current architecture and would enhance the platform:

### 📋 Short-term

- [ ] **Drag-and-drop task board** — Kanban-style task management with drag-and-drop status changes
- [ ] **File attachments** — Image and file upload in chat messages
- [ ] **Markdown message support** — Allow users to format messages with markdown
- [ ] **Room persistence** — Room creation with invite links and persistent room metadata
- [ ] **User presence** — Online/offline indicators for room members

### 🏗️ Medium-term

- [ ] **Multiple AI providers** — Support for OpenAI, Anthropic, Gemini alongside Groq
- [ ] **Decision tracking** — Explicit decision recording with confirmation workflow
- [ ] **Custom AI personas** — User-created personas with custom instructions
- [ ] **Thread support** — Reply threads for organized conversations
- [ ] **Search** — Full-text search across messages, tasks, notes, and documents
- [ ] **Notification system** — Push notifications for mentions and task assignments
- [ ] **Mobile PWA enhancements** — Offline chat, background sync, native sharing

### 🚀 Long-term

- [ ] **Voice/video calls** — Built-in WebRTC calling (infrastructure already exists)
- [ ] **AI code review** — Direct PR/commit analysis with Senior Architect persona
- [ ] **Integration API** — Webhooks and REST API for external integrations
- [ ] **Workspace templates** — Pre-configured rooms for common workflows (sprint planning, incident response, etc.)
- [ ] **Analytics dashboard** — Team productivity metrics and AI extraction effectiveness
- [ ] **Multi-language support** — i18n for international teams

---

## Contributing

We welcome contributions from the community! Here's how to get started.

### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Branch Naming Convention

| Branch Type | Pattern | Example |
|-------------|---------|---------|
| Feature | `feature/<description>` | `feature/ai-code-review` |
| Bug fix | `fix/<description>` | `fix/message-dedup-race` |
| Enhancement | `enhance/<description>` | `enhance/increase-window-size` |
| Refactor | `refactor/<description>` | `refactor/ai-worker-module` |
| Docs | `docs/<description>` | `docs/api-reference` |

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`

**Examples:**
- `feat(ai): add custom persona creation endpoint`
- `fix(chat): resolve duplicate message on reconnect`
- `perf(workspace): memoize task section selectors`

### Pull Request Process

1. Ensure your code passes type checks: `pnpm type-check`
2. Ensure linting passes: `pnpm lint`
3. Update the README if introducing new features or changing behavior
4. Include a clear description of the changes and motivation
5. Reference any related issues

### Development Tips

- Use `pnpm dev` in the root for the frontend and `cd server && pnpm dev` for the backend
- The mock development token (`mock-development-token`) lets you bypass Socket.IO auth in dev
- Check the `PIPELINE` log lines for AI pipeline debugging
- Use `Ctrl + Shift + M` to open the memory debug panel

---

## License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 ThinkRoom AI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">
  <br />
  <p>
    Built with ❤️ for collaborative teams everywhere.
    <br />
    <a href="https://github.com/yourusername/thinkroom-ai/issues">Report Bug</a>
    ·
    <a href="https://github.com/yourusername/thinkroom-ai/issues">Request Feature</a>
  </p>
</div>
