# LLMPal Features

## Core Features (MVP)
1. Secure authentication (email/password) with Supabase Auth.
2. Create, list, rename, and delete chats.
3. Real-time style chat flow with streaming assistant responses.
4. Message persistence per chat (user + assistant).
5. Image upload and attachment to messages.
6. Inline image rendering inside chat timeline.
7. Responsive UI for desktop and mobile web.
8. Command palette (`Cmd/Ctrl + K`) for quick actions and navigation.
9. Skeleton loading states for all async content regions.

## Message Model Types
- `user`: text from user.
- `assistant`: streamed + persisted model output.
- `media`: image attachment reference (linked to owning message).

## Upload + Media Support
- Supported in MVP: image upload and inline rendering.
- Upload destination: Supabase Storage bucket.
- Attachment metadata persisted in `attachments` table.
- Attachments displayed in message group context.

## UX and Interaction Requirements
- Smooth motion in message appearance and page transitions.
- Context-aware controls (show on hover/focus/selection).
- Intelligent auto-scroll that respects manual scroll override.
- Minimal clicks from chat creation to first prompt.

## MVP Scope
- Auth flow (sign in, sign up, sign out)
- Sidebar chat management
- Chat composer with text + image attach
- Streamed assistant responses (real API or simulated fallback)
- Persisted chat history
- Responsive premium UI system

## Future Features (Post-MVP)
- Voice recording from mic
- Audio message playback
- Full multimodal input (image + voice + text in one request)
- Shared chats and collaboration
- Prompt templates and reusable contexts
- Search across chat history

## Voice and Audio Readiness (Structure Only)
- Add types/interfaces for `AudioAttachment` and `VoiceInputState`.
- Add placeholder UI actions in composer for voice entry.
- Add hooks with TODO boundaries for recording/transcription provider integration.
- Keep backend route contracts extensible for multimodal payload arrays.
