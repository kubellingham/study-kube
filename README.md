# Studying Kube 📚🧊

Your own AI study companion — turn **PDFs, typed notes, YouTube videos, and web
articles** into:

- **Summaries & key concepts**
- **Flashcards** with spaced-repetition review (SM-2 lite)
- **Multiple-choice quizzes** that grade you and explain every answer
- An **AI tutor** you can chat with, grounded in _your_ material

Powered by your own **Claude API** key, with **Firebase** (Firestore + Auth +
Storage) saving your materials and progress.

---

## Tech stack

- **Next.js 16** (App Router) + React 19 + TypeScript + Tailwind CSS 4
- **Claude API** (`@anthropic-ai/sdk`, model `claude-opus-4-8`) — called only on
  the server, so your API key never reaches the browser
- **Firebase** — Firestore (data), Firebase Auth (login), Cloud Storage (PDFs),
  with security rules so each user only sees their own data. Firebase's
  first-class Android/iOS SDKs make the planned mobile apps a natural next step.

Server API routes verify a Firebase **ID token** (`Authorization: Bearer …`) and
use the Firebase **Admin SDK**; the browser reads/writes Firestore directly
under the security rules.

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Firebase project

1. Go to the [Firebase Console](https://console.firebase.google.com/) → **Add
   project** (free "Spark" plan is fine).
2. **Build → Authentication → Get started → Sign-in method → Email/Password →
   Enable.** (For the smoothest local testing you can leave email verification
   off.)
3. **Build → Firestore Database → Create database** (production mode).
4. **Build → Storage → Get started.**
5. Add a **Web app** (Project settings → General → Your apps → `</>`). Copy the
   config values into `.env.local` (next step).
6. **Service account:** Project settings → **Service accounts** → *Generate new
   private key*. You'll use `project_id`, `client_email`, and `private_key` from
   the downloaded JSON in `.env.local`.

### 3. Publish the security rules

Copy [`firestore.rules`](firestore.rules) into **Firestore → Rules → Publish**,
and [`storage.rules`](storage.rules) into **Storage → Rules → Publish**. These
restrict every document/file to its owner.

(If you use the Firebase CLI, `firebase deploy --only firestore:rules,storage`
works too.)

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | Where to find it |
| --- | --- |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com/) → API Keys |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase → Project settings → General → Web app config |
| `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` | the service-account JSON you downloaded |

> **`FIREBASE_PRIVATE_KEY`** must keep its `\n` escapes and be wrapped in double
> quotes — see `.env.example`. `.env.local` is gitignored; never commit it.

### 5. Run it

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), create an account, and add
your first material.

---

## How it works

1. **Add material** (`POST /api/materials`) — a PDF (text extracted with
   `unpdf`, original saved to Cloud Storage), pasted text, a YouTube link
   (transcript via `youtube-transcript`), or an article URL (readable text via
   `@extractus/article-extractor`). The normalized text is stored as a
   `materials` document in Firestore.
2. **Generate** — the Summary / Flashcards / Quiz tabs call `/api/summary`,
   `/api/flashcards`, `/api/quiz`. These use Claude **structured outputs** so the
   JSON is always valid, then persist the result to Firestore.
3. **Tutor** (`/api/tutor`) — streams Claude's reply token-by-token. Your
   material is placed in a **cached** system block so multi-turn chat over one
   document stays cheap.
4. **Reads** (lists, existing summaries/decks/quizzes/chat) happen directly from
   the browser via the Firestore SDK, guarded by the security rules.

Firestore collections: `materials`, `summaries` (doc id = material id), `decks`,
`cards`, `quizzes`, `attempts`, `messages`.

---

## Verifying end-to-end

1. Sign up, then add a material three ways: a **PDF**, **pasted text**, and a
   **YouTube link** + an **article URL**.
2. Open a material and generate its **Summary**, **Flashcards** (flip + grade a
   card), and **Quiz** (take it, check the graded results + explanations).
3. Open the **Tutor** tab and ask a question answered from the material — the
   reply should stream in, and the conversation should persist on reload.
4. Sign in as a second account — you should not see the first user's materials
   (Firestore security rules).

---

## Roadmap / not yet built

- **Public multi-user release:** this version uses your single server-side Claude
  key. Before going public, add per-user keys or metered billing + rate limits.
- **Lecture audio → transcript** (needs a speech-to-text step).
- **Vector search / RAG** for very large document libraries.
- **Native mobile / desktop apps** reusing this same API + Firebase project.

---

## Deploy

Deploys cleanly to [Vercel](https://vercel.com/new). Add the environment
variables from `.env.example` in the Vercel project settings.
