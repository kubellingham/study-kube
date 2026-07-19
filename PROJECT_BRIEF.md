# Studying Kube — Project Brief & Handoff

*A complete record of what has been built, how it works, what it costs to run, and where it can go next. Written to be pasted into a planning conversation (e.g. business/break-even analysis) or handed to any developer or AI assistant to continue the work.*

---

## 1. What it is

**Studying Kube** is a personal AI study companion in the spirit of Turbo AI / Studdy, built and owned by Isaac (kubellingham). A student adds study material — a **PDF, pasted notes, a YouTube video, or a web article** — and the app instantly turns it into:

- **Summary & key concepts** — a faithful, structured summary with the must-know terms explained
- **Flashcards** — auto-generated active-recall cards with a spaced-repetition review loop (SM-2 lite: Again / Good / Easy grading, ease + interval + due-date tracking)
- **Practice quizzes** — 4-option multiple-choice, graded instantly with per-question explanations; attempt history and best score saved
- **AI tutor chat** — a streaming chat grounded in *that specific material*, with conversation history persisted per material

Everything a user creates is saved to their account and only visible to them.

**Status: LIVE and working in production** at **https://studying-kube.vercel.app** — ingestion (PDF/text/link), flashcards, quiz, and tutor verified end-to-end by the owner on real study material. **One known defect: summary generation times out on large documents** (diagnosed, fix planned — see §8.1).

---

## 2. Accounts & infrastructure (all owned by Isaac)

| Piece | Where | Plan / cost |
|---|---|---|
| Source code | GitHub `kubellingham/study-kube`, branch `claude/studying-kube-tool-yrybsj` | free |
| Hosting | Vercel project `studying-kube` (team: kubellinghams-projects) | Hobby (free) — note: Hobby is licensed for **non-commercial** use; commercialising means Pro (~$20/mo) |
| Database + login | Firebase project `studying-kube` — Firestore + Firebase Auth (email/password) | Spark (free): 50K doc reads / 20K writes per day, 1 GiB storage |
| AI | Anthropic Claude API, model `claude-opus-4-8`, owner's API key | pay-per-token (see §7) |
| File storage | **Deliberately not used.** Firebase Cloud Storage now requires the paid Blaze plan; the app extracts PDF text server-side and stores only the text, so Storage is unnecessary. | $0 |

Environment variables (set in Vercel → Project → Settings → Environment Variables; never committed):
`ANTHROPIC_API_KEY`, `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`. (`NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` intentionally unset — keeps Firebase free.)

---

## 3. Tech stack & architecture

- **Next.js 16** (App Router) + React 19 + TypeScript + Tailwind CSS 4, built with **webpack** (`next build --webpack` — required; see §6)
- **Claude API** via `@anthropic-ai/sdk`, called **only in server API routes**, so the API key never reaches the browser
- **Firebase**: Firestore for all data, Firebase Auth for accounts; browser reads Firestore directly under owner-only security rules (`firestore.rules`); server routes verify the user's **Firebase ID token** (sent as `Authorization: Bearer`) before doing anything
- The backend is a clean JSON API (`app/api/*`) — a future **Android/iOS/desktop client can reuse it unchanged**, and Firebase has first-class mobile SDKs (this drove the Firebase choice)

**API routes** (each requires a valid Firebase ID token):
- `POST /api/materials` — ingests PDF (text extracted with `unpdf`), pasted text, YouTube link (transcript via `youtube-transcript`), or article URL (readable text via `@extractus/article-extractor`); stores normalized text in Firestore
- `POST /api/summary` / `POST /api/flashcards` / `POST /api/quiz` — Claude generation using **structured outputs** (Zod schema → guaranteed-valid JSON), persisted to Firestore
- `POST /api/tutor` — **streams** Claude's reply token-by-token; the material text sits in a **prompt-cached** system block so multi-turn chat over one document is ~90% cheaper after the first turn

**Claude usage details:** model `claude-opus-4-8` (overridable via `ANTHROPIC_MODEL`), adaptive thinking, effort `high` for generation; material clipped to ~120K characters per call; tutor keeps the last 20 turns of history.

**Firestore collections** (every doc carries `userId`; rules enforce owner-only read/write): `materials`, `summaries` (doc id = material id), `decks`, `cards`, `quizzes`, `attempts`, `messages`. Queries use equality-only filters so **no composite indexes are needed**.

---

## 4. What the user experience looks like

1. Sign up / sign in (email + password)
2. Dashboard: add material via three tabs (Paste text / Upload PDF / Paste link); materials listed as cards with type badges; delete supported
3. Open a material → four tabs: **Summary** (generate/regenerate), **Flashcards** (flip cards, grade Again/Good/Easy, spaced repetition reschedules), **Quiz** (take, submit, see score + explanations, retake or generate new), **Tutor** (streaming chat)
4. Everything persists across sessions and devices

---

## 5. The build journey (decisions that shaped it)

1. **Started from an empty repo**; planned features and stack interactively with the owner.
2. **Backend pivot: Supabase → Firebase.** v1 was built on Supabase (Postgres + RLS), fully working locally. Creating a dedicated Supabase project hit the **2-active-free-project limit** on the owner's account; owner chose a Google backend. Rewrote the data/auth layer to Firestore + Firebase Auth — which also aligned with the mobile-app roadmap.
3. **Cloud Storage skipped intentionally.** Firebase now paywalls Storage behind Blaze. Since the app only ever needs the *extracted text* (stored in Firestore), PDF originals aren't retained. Code silently skips Storage unless a bucket is configured.
4. **Deployment debugging saga** (the hard-won lesson of the project — see §6): three rounds of `ERR_REQUIRE_ESM` crashes on Vercel, fixed for good by removing `firebase-admin/auth` from the runtime entirely.
5. **Deployed from session to Vercel** via direct file upload (project `studying-kube`); owner added env vars in the Vercel dashboard. The Vercel project is **not yet git-linked** (see §9).

---

## 6. Critical technical lessons (do not regress these)

1. **`firebase-admin/auth` cannot run on Vercel's serverless runtime in this stack.** Its dependency chain (`jwks-rsa` → `jose`) gets resolved to jose's ESM build and `require()`d, throwing `ERR_REQUIRE_ESM`. It works locally (Node 22 supports `require(esm)`) but crashes on Vercel — the classic "works on my machine". Fixes that were NOT sufficient: `serverExternalPackages: ["firebase-admin"]` alone; switching to webpack alone.
   **The durable fix (current code):** ID tokens are verified in `lib/api-helpers.ts` with **`jose` directly** (`createRemoteJWKSet` against `https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com`, checking RS256, issuer `https://securetoken.google.com/<projectId>`, audience `<projectId>`, non-empty `sub` = uid). `jose` is bundled by webpack into the function, so no runtime module resolution is involved. `lib/firebase/admin.ts` must **never** import `firebase-admin/auth`.
2. **Build with webpack** (`next build --webpack`) and keep `serverExternalPackages: ["firebase-admin"]` in `next.config.ts` — Firestore/app/storage load fine as externals.
3. **A generic browser error can mask a server crash.** "Unexpected token '<', \"<!DOCTYPE\"... is not valid JSON" just means an API route returned an HTML error page; the real cause is in Vercel's runtime logs (Project → Logs).
4. **Vercel body limit:** uploads over ~4.5 MB are rejected by the platform before app code runs (shows the same generic error). Large-PDF support needs client-side extraction or a signed-upload path.

---

## 7. Unit economics — raw numbers for break-even analysis

**Claude API pricing (claude-opus-4-8): $5 per million input tokens, $25 per million output tokens.** Prompt cache reads ~0.1× input price; cache writes ~1.25×.

Rough per-operation cost on a typical lecture-sized document (~15–40K tokens of material, e.g. a 20–50 page PDF):

| Operation | Input | Output | Approx cost |
|---|---|---|---|
| Summary | material + prompt (~20–40K tok) | ~1–3K tok | **$0.10–0.25** |
| Flashcards (15 cards) | same | ~1–2K tok | **$0.10–0.25** |
| Quiz (8 questions) | same | ~1–2K tok | **$0.10–0.25** |
| Tutor, first turn | material (cache write, 1.25×) | ~0.5–1K tok | **$0.15–0.30** |
| Tutor, follow-up turns (cache hit) | ~0.1× on material | ~0.5–1K tok | **$0.02–0.06/turn** |

**Ballpark: fully processing one document (summary + deck + quiz + a 10-turn tutor session) ≈ $0.50–$1.25.** A heavy student using ~10 documents/month ≈ **$5–13/month** in API cost. Levers to cut cost 3–5×: switch to `claude-sonnet-5` ($3/$15 per MTok; one env var — `ANTHROPIC_MODEL`) or lower effort; quality tradeoff to be tested.

Fixed costs today: **$0** (Vercel Hobby + Firebase Spark + owner's existing Anthropic account). First fixed costs at commercialisation: Vercel Pro ~$20/mo (Hobby forbids commercial use), possibly Firebase Blaze as usage grows (generous free allowance continues under Blaze).

**The single biggest structural point for the business discussion:** the app currently runs on **the owner's one API key** — every user would spend the owner's money. Before any public release, choose one of:
1. **BYO key** — each user pastes their own Anthropic key (zero API cost to owner; high signup friction; keys must be stored/encrypted carefully)
2. **Subscription** — e.g. $5–10/mo with usage caps/rate limits; owner's key pays underlying costs; needs Stripe + per-user metering + abuse protection
3. **Freemium** — N free generations (owner absorbs ~$0.15–0.50/trial user), then paywall

---

## 8. Current status & known items

**Working (verified live by the owner):** signup/login, text + PDF + link ingestion, flashcard generation & review, quiz generation/taking/grading/history, streaming tutor chat. Firestore persistence and per-user isolation via security rules.

**Known items:**
1. **Summary generation is currently BROKEN on large documents (top of the fix list).** Verified in production logs: on the owner's real PDF, `/api/materials`, `/api/flashcards`, and `/api/quiz` all returned 200, but the `/api/summary` request never completed — no response, no error, UI stuck on "loading". Diagnosis: the summary is the app's only heavyweight **non-streaming** Claude call (whole document, high effort, up to 16K output tokens); on large materials it exceeds the Vercel function execution window and is killed silently. **Planned fix (~small):** stream the summary token-by-token exactly like the already-working tutor route (first byte in seconds → no timeout), saving the parsed result to Firestore at stream end; secondary levers: lower effort or `claude-sonnet-5` for the summary route.
2. **PDFs over ~4.5 MB** fail at the platform layer (see §6.4) with the generic JSON error. Mitigation not yet built.
3. **Scanned/image PDFs** have no extractable text — the app returns a clear error; OCR not yet supported.
4. **Vercel project is not git-linked** — deploys so far were pushed directly from the build session. Linking the GitHub repo in Vercel (Add New → Project → Import) would give automatic deploys on every push. Env vars are already configured and survive.

---

## 9. Roadmap candidates (not yet built)

- **Public release hardening:** per-user billing or BYO keys (see §7), rate limiting, abuse protection, terms/privacy, email verification
- **Git-link the Vercel project** for push-to-deploy
- **Better summary UX:** streaming render, progress state, per-section summaries for long docs
- **Large/scanned PDF support:** client-side extraction, signed uploads, OCR
- **Lecture audio → transcript** (speech-to-text step, e.g. before ingestion)
- **Study analytics:** streaks, per-topic mastery, quiz-score trends over time (data is already captured in `attempts` and card scheduling)
- **Mobile apps (Android/iOS):** reuse the same API routes + Firebase project; Firebase SDKs are mobile-native
- **RAG / vector search** if users accumulate very large libraries (current design sends whole-document context, which is simpler and works well per-material)

---

## 10. How to keep developing

- Repo: `kubellingham/study-kube`, branch `claude/studying-kube-tool-yrybsj` — README has full local setup (`.env.example` documents every variable)
- Local: `npm install`, copy `.env.example` → `.env.local` with real values, `npm run dev`
- Deploy: currently by pushing files to the Vercel project `studying-kube` (or git-link it for automatic deploys)
- Mind the §6 constraints when touching auth, the build system, or `firebase-admin`
