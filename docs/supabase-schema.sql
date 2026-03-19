-- LLMPal core schema
create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null default 'New Chat',
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  role text not null check (role in ('user', 'assistant', 'media')),
  content text,
  status text not null default 'complete' check (status in ('streaming', 'complete', 'error')),
  created_at timestamptz not null default now()
);

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  chat_id uuid not null references public.chats(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  kind text not null default 'image' check (kind in ('image')),
  storage_bucket text not null,
  storage_path text not null,
  public_url text,
  mime_type text,
  width int,
  height int,
  created_at timestamptz not null default now()
);

create index if not exists chats_user_updated_idx on public.chats(user_id, updated_at desc);
create index if not exists messages_chat_created_idx on public.messages(chat_id, created_at asc);
create index if not exists attachments_chat_created_idx on public.attachments(chat_id, created_at asc);

alter table public.users enable row level security;
alter table public.chats enable row level security;
alter table public.messages enable row level security;
alter table public.attachments enable row level security;

drop policy if exists "users_select_own" on public.users;
create policy "users_select_own" on public.users
for select using (auth.uid() = id);

drop policy if exists "users_upsert_own" on public.users;
create policy "users_upsert_own" on public.users
for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "chats_own_all" on public.chats;
create policy "chats_own_all" on public.chats
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "messages_own_all" on public.messages;
create policy "messages_own_all" on public.messages
for all using (
  exists (
    select 1 from public.chats c
    where c.id = messages.chat_id and c.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.chats c
    where c.id = messages.chat_id and c.user_id = auth.uid()
  )
);

drop policy if exists "attachments_own_all" on public.attachments;
create policy "attachments_own_all" on public.attachments
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
