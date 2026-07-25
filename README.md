# ThinkRoom AI

AI-native collaborative workspace where AI behaves like a teammate instead of a chatbot.

## 1. Project Overview

ThinkRoom AI is an innovative, real-time collaboration environment designed to integrate artificial intelligence seamlessly into team workflows. Instead of acting as a standalone chatbot, the AI functions as an active participant—a teammate that extracts tasks, logs decisions, and maintains the workspace in real time.

## 2. Landing Page

The public-facing landing page is designed as a premium product experience with a brutalist design language.

### Design System

| Token                  | Value       |
| ---------------------- | ----------- |
| Cream background       | `#FFFDF7`   |
| Ink text               | `#1A1A1A`   |
| Accent purple          | `#7C5CFC`   |
| Navbar background      | `#B084D7`   |
| Footer background      | `#F2E29F`   |
| Font                   | Inter       |
| Border radius (cards)  | 24px        |
| Border width           | 3px         |
| Shadow style           | Hard shadow |

### Section Order & Background Palette

1. **Navbar** (`#B084D7`) — scroll-spy navigation, active pill `#C9A0E0`
2. **Hero** (`#FAF8F3`, id: `hero`) — main CTA, "Watch Demo" YouTube link
3. **InteractiveProduct** (`#FFFFFF`, id: `product`) — product demo
4. **AI Superpowers** (`#FFF7F8`, id: `ai-superpowers`) — 4 premium showcases (Context Memory, Auto Task Extraction, Meeting Summaries, Decision Timeline)
5. **How ThinkRoom Thinks** (`#FAF8F3`, id: `how-thinkroom-thinks`) — 5-step horizontal workflow
6. **BeforeAfter** (`#FFF3F5`, id: `comparison`) — comparison section, excluded from scroll-spy nav
7. **FAQ** (`#FFFFFF`, id: `faq`) — accordion
8. **FinalCTA** (`#FAF8F3`, id: `final-cta`) — "Start Collaborating", "Watch Live Demo" YouTube link
9. **Footer** (`#F2E29F`) — compact layout, no newsletter, 4-column middle

### Key Features

- **MagneticButton** — hover magnetic interaction on CTAs
- **WavySeparator** — fluid transitions between sections (color matches previous section bg)
- **useScrollSpy** — IntersectionObserver-based scroll tracking with `rootMargin: "-30% 0px -60% 0px"`
- **sectionNavMap** — maps section IDs to nav labels; excludes `comparison` so BeforeAfter doesn't highlight a nav item

## 3. App Features (Internal Workspace)

- Realtime collaborative rooms
- AI personas (Gemini, OpenAI, Groq)
- AI task extraction from conversation
- AI workspace state management
- Shadow AI note-taking
- Decision intelligence & timeline
- Documentation generation
- Summaries & meeting notes
- Realtime sync via Socket.IO

## 4. Architecture

Frontend (Next.js) communicates via Socket.IO with an Express.js backend. The backend interfaces with PostgreSQL for persistence and leverages Gemini, OpenAI, and Groq APIs for AI extraction and persona pipelines. Authentication is handled by Supabase.

## 5. Tech Stack

- **Frontend:** Next.js 16, React 19, Framer Motion, Zustand, Supabase Auth, Tailwind CSS v4
- **Backend:** Node.js, Express, Socket.IO
- **Database:** PostgreSQL
- **AI Integration:** Gemini API, OpenAI API, Groq API

## 6. Installation

Clone the repository:

```bash
git clone https://github.com/your-username/thinkroom-ai.git
cd thinkroom-ai
```

Install dependencies:

```bash
pnpm install
```

## 7. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_URL=https://<your-project-id>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
DATABASE_URL=your_postgresql_connection_string
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
```

## 8. Running Locally

Start the backend server:

```bash
cd server
npm run dev
```

Start the frontend application:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Lint and type-check:

```bash
npm run lint
npm run type-check
```

## 9. Project Structure

```
thinkroom-ai/
├── src/
│   ├── components/
│   │   └── landing/
│   │       ├── sections/        # Landing page sections
│   │       │   ├── Navbar.tsx
│   │       │   ├── Hero.tsx
│   │       │   ├── InteractiveProduct.tsx
│   │       │   ├── Features.tsx
│   │       │   ├── HowItWorks.tsx
│   │       │   ├── BeforeAfter.tsx
│   │       │   ├── FAQ.tsx
│   │       │   ├── FinalCTA.tsx
│   │       │   └── Footer.tsx
│   │       ├── hooks/
│   │       │   └── useScrollSpy.ts
│   │       ├── ui/
│   │       │   ├── MagneticButton.tsx
│   │       │   └── WavySeparator.tsx
│   │       ├── ProductionLandingPage.tsx
│   │       └── landing-theme.css
│   ├── lib/
│   │   ├── supabase.ts
│   │   └── supabase-server.ts
│   └── app/
├── server/                      # Express.js backend
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   └── index.ts
│   └── tsconfig.json
├── supabase/                    # Supabase config & migrations
├── public/                      # Static assets
└── package.json
```

## 10. Future Roadmap

- Enhanced AI-driven project management
- Extended integration with external tools (GitHub, Jira, Linear)
- Customizable AI personas for distinct team roles
- Advanced metrics and analytics for team productivity
- Mobile-native experience

## 11. Why ThinkRoom AI Is Different

Unlike conventional tools where AI is siloed in a separate chat window, ThinkRoom AI embeds intelligence into the collaboration layer. The Shadow AI actively listens, analyzes conversations, and synthesizes actionable insights automatically. Teams can focus on brainstorming and problem-solving, while the AI teammate takes care of documentation, task assignment, and capturing critical decisions.
