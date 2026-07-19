# Studying Kube 📚🧊

Your own AI study companion — turn **PDFs, typed notes, YouTube videos, and web
articles** into:

- **Summaries & key concepts**
- **Flashcards** with spaced-repetition review (SM-2 lite)
- **Multiple-choice quizzes** that grade you and explain every answer
- An **AI tutor** you can chat with, grounded in _your_ material

Powered by your own **Claude API** key. Everything you add is saved to your
Supabase account so your progress persists.

---

## Tech stack

- **Next.js 16** (App Router) + React 19 + TypeScript + Tailwind CSS 4
- **Claude API** (`@anthropic-ai/sdk`, model `claude-opus-4-8`) — called only on
  the server, so your API key never reaches the browser
- **Supabase** — Postgres + Auth + Storage, with Row-Level Security so each user
  only sees their own data

The backend is a plain JSON API (`app/api/*`), so a future mobile / desktop
client can reuse it without a rewrite.

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

Create a free project at [supabase.com](https://supabase.com/). Then apply the
schema:

- Open **SQL Editor** in your Supabase dashboard, paste the contents of
  [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql), and
  run it. This creates all tables, Row-Level-Security policies, and the private
  `materials` storage bucket.

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | Where to find it |
| --- | --- |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com/) → API Keys |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API (anon public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (service_role) |

`.env.local` is gitignored — never commit real keys.

> **Tip:** In Supabase → Authentication → Providers → Email, you can turn **off**
> "Confirm email" for the smoothest local testing (sign up → straight in).

### 4. Run it

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), create an account, and add
your first material.

---

## How it works

1. **Add material** (`POST /api/materials`) — a PDF (text extracted with
   `unpdf`), pasted text, a YouTube link (transcript via `youtube-transcript`),
   or an article URL (readable text via `@extractus/article-extractor`). The
   normalized text is stored in the `materials` table.
2. **Generate** — the Summary / Flashcards / Quiz tabs call
   `/api/summary`, `/api/flashcards`, `/api/quiz`. These use Claude
   **structured outputs** so the JSON is always valid, then persist the result.
3. **Tutor** (`/api/tutor`) — streams Claude's reply token-by-token. Your
   material is placed in a **cached** system block so multi-turn chat over one
   document stays cheap.
4. **Reads** (lists, existing summaries/decks/quizzes/chat) happen directly from
   the browser via the RLS-protected Supabase client — fast and secure.

---

## Verifying end-to-end

1. Sign up, then add a material three ways: a **PDF**, **pasted text**, and a
   **YouTube link** + an **article URL**.
2. Open a material and generate its **Summary**, **Flashcards** (flip + grade a
   card), and **Quiz** (take it, check the graded results + explanations).
3. Open the **Tutor** tab and ask a question answered from the material — you
   should see the reply stream in, and the conversation persists on reload.
4. Sign in as a second user — you should not see the first user's materials
   (Row-Level Security).

---

## Roadmap / not yet built

- **Public multi-user release:** this version uses your single server-side key.
  Before going public, add per-user keys or metered billing + rate limits.
- **Lecture audio → transcript** (needs a speech-to-text step).
- **pgvector RAG** for very large document libraries.
- **Native mobile / desktop apps** reusing this same API.

---

## Deploy

Deploys cleanly to [Vercel](https://vercel.com/new). Add the four environment
variables from `.env.example` in the Vercel project settings.
