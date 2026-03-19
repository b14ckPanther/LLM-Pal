# LLMPal Architecture

## Product Goal
LLMPal is a premium, dark-first, multimodal-ready AI chat web app focused on smooth UX, low friction interactions, and clean, expressive visual design.

## High-Level System Architecture
- **Frontend**: Next.js App Router (TypeScript), Tailwind CSS, custom-styled shadcn primitives, Framer Motion.
- **Backend (BaaS)**: Supabase for authentication, Postgres database, row-level security (RLS), and Storage for image uploads.
- **State Layer**: Zustand for lightweight client state (UI state, active chat context, optimistic message rendering).
- **LLM Layer**: Server route handlers in Next.js call model APIs (provider-agnostic abstraction) and stream assistant responses back to client.

## Core Runtime Topology
1. User authenticates with Supabase Auth.
2. User creates/selects a chat.
3. User sends text and optional image attachments.
4. Message metadata persists in Supabase (`messages`, `attachments`).
5. App calls a Next.js API route (`/api/chat/stream`).
6. Route fetches chat context from Supabase, calls LLM API, streams tokens to client.
7. Client renders streamed assistant output with progressive UI updates.
8. Final assistant message persists in Supabase.

## Data Flow (Client -> Supabase -> LLM API)
1. **Client -> Supabase**
   - Auth session check
   - CRUD for chats/messages/attachments
   - Storage upload for images
2. **Client -> Next.js API**
   - Send message payload (chat id, text, attachment refs)
   - Request streaming assistant completion
3. **Next.js API -> Supabase**
   - Validate ownership and fetch recent thread context
4. **Next.js API -> LLM Provider**
   - Submit structured messages (text + image references for future multimodal extension)
   - Receive stream chunks
5. **Next.js API -> Client**
   - Forward stream chunks
   - Signal completion
6. **Client / API -> Supabase**
   - Persist assistant final message

## Tech Stack Decisions
- **Next.js App Router**: first-class server/client composition, route handlers for streaming.
- **TypeScript**: strong typing across DB models, API contracts, and UI props.
- **Tailwind + customized shadcn**: fast systemized UI with full visual control; avoids template look.
- **Framer Motion**: intentional page/micro transitions and message choreography.
- **Supabase**: production-ready auth/db/storage with RLS and great DX.
- **Zustand**: simple, predictable state for chat/session UI without boilerplate.

## Folder Structure (Target)
```
/app
  /(auth)
  /(chat)
  /api
/components
  /ui
  /layout
  /chat
  /auth
/features
  /chat
  /auth
  /media
  /command-palette
/hooks
/lib
  /supabase
  /llm
  /utils
/types
/docs
```

## Separation of Concerns
- `app`: routing, pages, and server boundaries.
- `features`: feature-level logic and composition.
- `components`: reusable visual building blocks.
- `lib`: integrations (Supabase, streaming, provider adapters).
- `hooks`: shared client behavior hooks (autoscroll, media upload, keyboard shortcuts).
- `types`: domain and API contracts.

## Future-Ready Extension Points
- Provider abstraction in `lib/llm` for model switching.
- Message schema supports multimodal payloads.
- Voice/audio interfaces defined now; implementation added later without structural refactor.
