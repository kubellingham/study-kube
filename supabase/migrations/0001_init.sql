-- Studying Kube — initial schema
-- Every user-owned table carries user_id and enforces Row-Level Security so a
-- signed-in user can only ever read/write their own rows.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- materials: a piece of study material (pdf, pasted text, youtube, article)
-- ---------------------------------------------------------------------------
create table if not exists public.materials (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  title       text not null,
  source_type text not null check (source_type in ('pdf', 'text', 'youtube', 'article')),
  source_url  text,
  raw_text    text not null default '',
  created_at  timestamptz not null default now()
);
create index if not exists materials_user_created_idx
  on public.materials (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- summaries: one AI summary per material (regenerating replaces it)
-- ---------------------------------------------------------------------------
create table if not exists public.summaries (
  id          uuid primary key default gen_random_uuid(),
  material_id uuid not null references public.materials (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  content     jsonb not null,
  created_at  timestamptz not null default now()
);
create unique index if not exists summaries_material_uniq
  on public.summaries (material_id);

-- ---------------------------------------------------------------------------
-- flashcards
-- ---------------------------------------------------------------------------
create table if not exists public.flashcard_decks (
  id          uuid primary key default gen_random_uuid(),
  material_id uuid not null references public.materials (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  title       text not null,
  created_at  timestamptz not null default now()
);
create index if not exists flashcard_decks_material_idx
  on public.flashcard_decks (material_id);

create table if not exists public.flashcards (
  id            uuid primary key default gen_random_uuid(),
  deck_id       uuid not null references public.flashcard_decks (id) on delete cascade,
  user_id       uuid not null references auth.users (id) on delete cascade,
  front         text not null,
  back          text not null,
  -- SM-2 lite spaced-repetition state
  ease          real not null default 2.5,
  interval_days integer not null default 0,
  due_at        timestamptz not null default now(),
  created_at    timestamptz not null default now()
);
create index if not exists flashcards_deck_due_idx
  on public.flashcards (deck_id, due_at);

-- ---------------------------------------------------------------------------
-- quizzes + attempts
-- ---------------------------------------------------------------------------
create table if not exists public.quizzes (
  id          uuid primary key default gen_random_uuid(),
  material_id uuid not null references public.materials (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  title       text not null,
  questions   jsonb not null,
  created_at  timestamptz not null default now()
);
create index if not exists quizzes_material_idx
  on public.quizzes (material_id);

create table if not exists public.quiz_attempts (
  id       uuid primary key default gen_random_uuid(),
  quiz_id  uuid not null references public.quizzes (id) on delete cascade,
  user_id  uuid not null references auth.users (id) on delete cascade,
  score    real not null,
  answers  jsonb not null,
  taken_at timestamptz not null default now()
);
create index if not exists quiz_attempts_quiz_idx
  on public.quiz_attempts (quiz_id, taken_at desc);

-- ---------------------------------------------------------------------------
-- tutor chat (one implicit conversation per material)
-- ---------------------------------------------------------------------------
create table if not exists public.chat_messages (
  id          uuid primary key default gen_random_uuid(),
  material_id uuid not null references public.materials (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  role        text not null check (role in ('user', 'assistant')),
  content     text not null,
  created_at  timestamptz not null default now()
);
create index if not exists chat_messages_material_idx
  on public.chat_messages (material_id, created_at);

-- ---------------------------------------------------------------------------
-- Row-Level Security: owner-only access on every table
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'materials', 'summaries', 'flashcard_decks', 'flashcards',
    'quizzes', 'quiz_attempts', 'chat_messages'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "owner_all" on public.%I;', t);
    execute format(
      'create policy "owner_all" on public.%I
         for all
         using (user_id = auth.uid())
         with check (user_id = auth.uid());', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Storage bucket for uploaded PDF originals (private, owner-scoped)
-- Files are stored at path: <user_id>/<material_id>.pdf
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('materials', 'materials', false)
on conflict (id) do nothing;

drop policy if exists "materials_owner_read" on storage.objects;
create policy "materials_owner_read" on storage.objects
  for select using (
    bucket_id = 'materials'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "materials_owner_write" on storage.objects;
create policy "materials_owner_write" on storage.objects
  for insert with check (
    bucket_id = 'materials'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "materials_owner_delete" on storage.objects;
create policy "materials_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'materials'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
