# LLMPal Database Design (Supabase)

## Schema Overview
Core tables:
- `users` (profile mirror tied to auth user)
- `chats`
- `messages`
- `attachments` (image metadata)

Supabase Auth (`auth.users`) remains source of truth for credentials and identity.

## Tables

### `users`
- `id` (uuid, primary key, references `auth.users.id`)
- `email` (text, unique)
- `display_name` (text, nullable)
- `avatar_url` (text, nullable)
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

### `chats`
- `id` (uuid, primary key, default gen_random_uuid())
- `user_id` (uuid, not null, references `users.id`)
- `title` (text, not null, default 'New Chat')
- `last_message_at` (timestamptz, nullable)
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

### `messages`
- `id` (uuid, primary key, default gen_random_uuid())
- `chat_id` (uuid, not null, references `chats.id` on delete cascade)
- `user_id` (uuid, nullable, references `users.id`)
- `role` (text, not null; enum-like: `user`, `assistant`, `media`)
- `content` (text, nullable for pure media entries)
- `status` (text, not null, default `complete`; e.g. `streaming`, `complete`, `error`)
- `created_at` (timestamptz, default now())

### `attachments`
- `id` (uuid, primary key, default gen_random_uuid())
- `message_id` (uuid, not null, references `messages.id` on delete cascade)
- `chat_id` (uuid, not null, references `chats.id` on delete cascade)
- `user_id` (uuid, not null, references `users.id`)
- `kind` (text, not null, default `image`)
- `storage_bucket` (text, not null)
- `storage_path` (text, not null)
- `public_url` (text, nullable)
- `mime_type` (text, nullable)
- `width` (int, nullable)
- `height` (int, nullable)
- `created_at` (timestamptz, default now())

## Relationships
- One `users` -> many `chats`
- One `chats` -> many `messages`
- One `messages` -> many `attachments`
- `attachments.chat_id` denormalized for faster policy checks and queries

## Suggested Indexes
- `chats (user_id, updated_at desc)`
- `messages (chat_id, created_at asc)`
- `attachments (chat_id, created_at asc)`
- `messages (user_id, created_at desc)` optional for user analytics

## RLS Basics
Enable RLS on all user data tables and enforce ownership:
- Users can only read/write their own `users` row.
- Users can only read/write `chats` where `chat.user_id = auth.uid()`.
- Users can only read/write `messages` through owned chats.
- Users can only read/write `attachments` tied to owned chats.

## Example Policy Intent
- **Select chats**: allow when `user_id = auth.uid()`
- **Insert message**: allow when parent chat belongs to `auth.uid()`
- **Delete attachment**: allow when `attachments.user_id = auth.uid()`

## Storage (Images)
- Bucket: `chat-media` (private preferred; signed URLs for render)
- Path convention: `${user_id}/${chat_id}/${message_id}/${filename}`
- Policies:
  - Upload: only authenticated owner path
  - Read: signed URL flow for private objects
  - Delete: only owner

## Implementation Artifact
- SQL bootstrap script is available at `docs/supabase-schema.sql` to provision tables, indexes, and baseline RLS policies.
