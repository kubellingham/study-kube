# Kube — where things stand

The handoff. A new session loads this automatically (via `CLAUDE.md`), so it
starts where the last one stopped instead of from zero. **Keep it true:** any PR
that changes what's written here updates it in the same PR.

`WALK.md` is the running findings list (fix-on-sight / fixed / Isaac's call /
after launch). `PROJECT_BRIEF.md` describes the **old** product (materials,
summaries, quizzes) and is out of date. Trust this file over it.

*Last updated: 2026-09-25, after #52.*

---

## 1. Who, and how we work

- **Isaac** (GitHub `kubellingham`) is the founder and the only developer. He's a
  CS diploma student at LPU. Studying Kube is a real product going to real
  students.
- **Talk founder to founder, in plain words.** Explain how a thing *behaves*
  for a student, not how it's coded. Take it slow, one thing at a time.
- **Don't raise what he didn't raise.** If he hasn't mentioned something, act
  as if it isn't there. No new ideas before launch. When one comes up anyway,
  it goes on the after-launch list in `WALK.md`, not into the code.
- **The goal right now is launch.** Make what exists work start to end, then
  put it in front of people. People are the real test.
- **Isaac decides** pricing, copy, promises and taste. Note those under
  "Isaac's call" in `WALK.md` and leave them alone. Broken, untrue or
  unreachable things are fixed without discussion.
- **Be honest about what isn't proven.** Two past mistakes to not repeat: a
  cost estimate that was ~80× too low (pictures), and assuming Storage worked
  because the code was wired up. If it hasn't run for real, say so.

## 2. The product

A student makes a **subject**, feeds it their course documents (PDFs, slides,
notes, pictures), and Kube builds it into something to climb:

- **Ladder** (a "Path"): ordered units, each a column of circles, climbed in order.
- **Map**: topic clusters, no fixed order. Chosen when the subject is created.
  The mode is locked after that.
- **Circle** = one topic. **The rule (agreed, in `CIRCLE_RULE` in
  `lib/course/generate.ts`):** *a circle is ONE idea a lecturer would put on the
  syllabus, or an exam would ask about by name. Depth lives inside it, in its
  quarters, never in extra circles. Every named thing in the material goes in
  exactly one circle's `covers`.* Bigger circles, fewer of them.
- **Quarters** = the lessons inside a circle. Light topic 2–3, medium 4,
  heavy up to 6.
- Around the ladder: **practice gym** (sprints, definitions drill, weak spots),
  **mock exam**, **glossary**, **mistakes book**, **flashcards**, the in-lesson
  **tutor chat**, "Today" plan, study rhythm, notes.
- **Crew**: a group plan. A leader shares subjects with members.
- **Taster** (`/try`): a public sample climb, no sign-up. It's adequate and
  will be improved after launch.
- **Shelf** (hold material, build later): built, but **hidden**. It needs
  Firebase Storage, which needs the Blaze plan. Isaac's billing address was
  refused. It turns on by itself when `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` is
  set. No code change needed.

## 3. Plans and what each one gets

| Plan | Price (USD) | Gets |
|---|---|---|
| Free | $0 | **12 topics, lifetime**, built and taught in full, kept forever. Includes practice. |
| Climb | $2.99/mo ($0.99 first month), $29.99/yr | The whole ladder visible. **The first 3 topics of every subject taught in full** (a taste of Summit). Unlimited builds. Practice gym. |
| Summit | $9.99/mo ($5.99 first month), $99.99/yr | Everything taught in full, plus the tutor chat. |
| Crew | 4 seats $23.99/mo, 6 seats $29.99/mo (annual ≈ 2 months free) | Summit for the group, plus a shared library. |

**What happens when a plan changes (Isaac's policy):**

- Upgrading never takes anything away. Topics built on free keep a `gift`
  stamp and stay open on every plan.
- Downgrading returns you to that tier's rights.
- Cancelling drops you to the **free floor**: the first 12 topics (oldest
  subject first, units in order). Never below that.
- Nothing is ever deleted.
- A lapsed account keeps its floor of topics but **not** the practice gym
  (Isaac still to confirm).

**How the free allowance works:** it's counted in circles, and only taught
topics count (review circles don't). If a document holds more topics than you
have left, Kube builds the ones you have room for and says what it left out.
If fewer than 3 remain, it builds nothing and lists what's in the file instead.
No fragments. `FREE_BUILD=0` in Vercel stops **new** free builds (the kill
switch) without touching anything already built.

Code: `lib/entitlement.ts` (`circleOpen`, `mayClimb`, `CLIMB_TASTE = 3`,
`FREE_TOPIC_ALLOWANCE = 12`), `lib/entitlement-server.ts` (`getEntitlement`,
`requireBuildAccess`, `requireStudyAccess`, `spendFreeTopics`, `freeFloor`),
`lib/learn/access.ts` (`openCircleIds`). **Locks are UI-only today.** The lesson
JSON sits in the student's own course doc. Server-side locks are on the
after-launch list.

## 4. How a build works (the digest)

1. **Read** (`/api/course/observe`): Kube looks at the upload and asks one
   question: build straight from it, or add Kube's own knowledge?
2. **Build** (`/api/course/ingest`, runs in `after()`; the browser watches the
   `ingestJobs` doc):
   - **Pictures first**: each image is read once into text by the cheap read
     model (`readPictures`, up to 16, in parallel batches of 6). After that the
     build is text-only. This was the $2.60 build; it should now cost cents.
     *Not yet proven live.*
   - **Skeleton**: the list of circles. Topic count scales with length
     (`topicTarget`).
   - **Dedupe**: `dropRepeatedCircles` drops circles the subject already has.
     Tested on the real 27 PHP circles, it dropped exactly 3.
   - **Free cap**: sliced to what's left of the 12.
   - **Drill**: writes each circle's quarters.
   - **Verify**: re-checks answer keys.
   - **Save**.
3. **One clock** (`digestClock`) keeps all of it inside Vercel's 300s, with
   reserves for verify and save and a watchdog. A part-built file is saved as
   `partial` and can be finished by adding it again.

Per-build cost is recorded and shown in `/admin` (owner only, passkey).

## 5. Models and money

All AI goes through **OpenRouter**, one shared balance for every user
(`lib/openrouter.ts`, all overridable by env):

| Job | Model |
|---|---|
| Build (skeleton, drill) | `deepseek/deepseek-chat` (`OPENROUTER_CLIMB_MODEL`) |
| Reading pictures | `google/gemini-3.1-flash-lite` (`OPENROUTER_READ_MODEL`; **slug not yet confirmed on OpenRouter**), falling back to `openai/gpt-4o-mini` |
| Summit build | same as Climb unless `OPENROUTER_SUMMIT_MODEL` is set |

The Anthropic path (`ANTHROPIC_API_KEY`) is only for Isaac's own premium runs
(`OWNER_PREMIUM=1` or `SUMMIT_ENGINE=sonnet`).

**Per-person limits (#50).** These live in memory on each server instance, so
they aren't exact across the fleet, but they stop one person or a script from
draining the balance:

| Door | Limit |
|---|---|
| Build (ingest) | 5 / 10 min |
| Read (observe) | 10 / 10 min |
| Tutor chat (Summit) | 30 / 10 min |
| Chat note (after a chat) | 30 / 10 min, then silently skipped |
| Definitions check | 60 / 10 min |
| Flashcards | 6 / 10 min |
| Re-mark a course | 5 / 10 min |
| Promo code, crew join | 10 / 10 min |
| Free builds | 12 topics lifetime (stored, exact) |

The old materials app (`/dashboard`, `/materials` and its summary, quiz,
flashcards and tutor routes) was **deleted** in #52. One piece of it lives on:
`lib/ingest/pdf.ts` (with `IngestResult` in `lib/types.ts`) is the build's
server-side PDF reader, used through `lib/ingest/office.ts`. Keep it. Its
`unpdf` library causes the one harmless build warning.

**The monthly allowance (#51)** is the real per-person wall. It's
`lib/spend.ts`. Every AI door checks it before spending and records what the
call really cost afterwards. OpenRouter reports each call's actual charge
(`usage: { include: true }`), and the meter uses that. Only calls without a
figure fall back to a token estimate. It's stored in Firestore
(`spend/{uid}`: `month`, `usd`, `byKind`, and `history` of past months), so
it's exact across every server instance. Only the server can read or write it.

| Plan | Kube may spend on them per month (USD) | Env to change it |
|---|---|---|
| Free / lapsed | $0.50 | `ALLOWANCE_FREE_USD` |
| Climb | $1.00 | `ALLOWANCE_CLIMB_USD` |
| Summit | $4.00 | `ALLOWANCE_SUMMIT_USD` |
| Crew (per person) | same as Summit | `ALLOWANCE_CREW_USD` |

How it behaves:

- **Building and reading** (build, observe, re-mark) stop at 100%.
- **Help inside lessons** (tutor, drill checks, cards, chat notes) keeps going
  to 125% (`STUDY_GRACE`), so nobody is cut off mid-lesson because a big
  upload used the month.
- A build that has started always finishes. The check happens before, and the
  cost is recorded after, even when the build fails.
- Opening and climbing lessons costs nothing and is never blocked.
- It refills at midnight UTC on the 1st.
- The owner (`lib/owner.ts`) is counted but never stopped.
- If the ledger can't be read, Kube lets the student through.
- `SPEND_ALLOWANCE=0` turns enforcement off (spend is still recorded).
- **Students see a share, never dollars**: the account page shows a bar with
  "N% used, refills on 1 October".
- **Isaac sees dollars**: `/admin` shows this month's total and the top 25
  people by cost.

## 6. Payments (Stripe)

- **Proven end to end in the sandbox**: checkout, webhook (signature
  verified), plan applied, customer portal, cancel. A second subscription no
  longer erases the first (`stripeSubs` map, #44).
- Products and prices are created by one click in `/admin` (lookup keys
  `climb_month`, `climb_annual`, `summit_…`, `crew4_…`, `crew6_…`; intro
  coupons `climb_intro`, `summit_intro`).
- The app lives at **https://studying-kube.vercel.app**. The webhook points
  there.
- **Not live yet.** See "Waiting on Isaac".

## 7. Security

- **Firestore rules** (`firestore.rules`, deployed by Isaac): deny by default.
  The browser may only write its own study-state collections (the
  `browserOwned()` list). Plans, courses and jobs are written only by the
  server. `courses` is readable by the owner and their crew.
- The server uses the Admin SDK (bypasses rules). ID tokens are verified with
  `jose`, never `firebase-admin/auth`.
- Secrets (`sk_…`, `whsec_…`, the Firebase private key, API keys) live **only**
  in Vercel env. Never in the repo, never in a `NEXT_PUBLIC_` name.
- `/admin` is owner-only (`lib/owner.ts`) and behind a passkey.
- `storage.rules` is written (owner-only `shelf/{uid}/**`) but not deployed,
  because Storage is off.

## 8. Env vars (Vercel)

Required: `OPENROUTER_API_KEY`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`,
`FIREBASE_PRIVATE_KEY`, `NEXT_PUBLIC_FIREBASE_API_KEY`,
`NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`,
`NEXT_PUBLIC_FIREBASE_APP_ID`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.

Optional: `NEXT_PUBLIC_APP_URL` (defaults to the vercel.app domain),
`NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` (turns the shelf on), `FREE_BUILD=0`
(kill switch), `OPENROUTER_*_MODEL` / `*_PRICE_*` (model swaps),
`ANTHROPIC_API_KEY` / `OWNER_PREMIUM` / `SUMMIT_ENGINE` (owner premium),
`ALLOWANCE_*_USD` (monthly allowances, §5), `SPEND_ALLOWANCE=0` (stop
enforcing them).

## 9. Where things live

| Thing | File |
|---|---|
| Build pipeline | `app/api/course/ingest/route.ts` |
| Prompts, circle/quarter rules, dedupe, picture reader | `lib/course/generate.ts` |
| Plans and locks | `lib/entitlement.ts`, `lib/entitlement-server.ts`, `lib/learn/access.ts` |
| Ladder / map / lesson | `app/learn/[courseId]/page.tsx`, `app/learn/[courseId]/MapBoard.tsx`, `…/lesson/[topicId]/page.tsx` |
| Upload | `app/learn/components/AddMaterial.tsx` |
| Plans page | `app/learn/upgrade` |
| Stripe | `lib/stripe.ts`, `app/api/stripe/*` |
| Rate limiter | `lib/rate-limit.ts` |
| Monthly allowance | `lib/spend.ts` |
| Admin | `app/admin` |

## 10. Workflow and gotchas

- **Stack:** Next.js 16 App Router (not the Next.js in anyone's training data;
  read `node_modules/next/dist/docs/` first, per `AGENTS.md`), React 19,
  TypeScript, Firebase, Vercel Hobby (`maxDuration = 300`).
- **Default branch:** `claude/studying-kube-tool-yrybsj`. Vercel deploys from it.
- **Each change:** `git fetch origin claude/studying-kube-tool-yrybsj`, branch
  off the fresh `origin/…`, then run `npx tsc --noEmit`, `npx eslint <changed
  files>` and `npm run build`. Open a PR and squash-merge. Commit titles look
  like `area: what changed, in plain words (#N)`.
- **Stale ref trap:** twice, a branch cut from an old `origin/` ref silently
  reverted merged work. Always fetch first, and rebase before opening the PR.
- **Lint:** the repo has some pre-existing lint errors, so lint only the files
  you changed. A function named `use…` is treated as a hook, and
  set-state-in-effect is flagged (use an async IIFE with an `alive` flag).
- **Deleting files:** needs Isaac's explicit OK in the session. Before
  deleting, grep for importers: "unreachable" was once wrong about
  `lib/ingest/pdf.ts`.
- **Egress:** outbound network from the sandbox is restricted. OpenRouter and
  Stripe can't be called from here, so live tests are Isaac's.

## 11. Status

### Shipped (recent)

#35 digest never freezes, resumable partials · #36–37 shelf (hidden) ·
#38 map parity · #39–40 honest-walk fixes · #41 Firestore lockdown and code
rate limits · #43 domain · #44 two subscriptions · #45 free = 12 topics ·
#46 circle definition and dedupe · #47 quarters sized to the idea ·
#48 tiers (gifts, Climb taste, free floor) · #49 pictures read once ·
#50 per-person limits on every AI door and this file · #51 the monthly
allowance, counted in real dollars · #52 the old materials app deleted.

### Not proven live yet (needs OpenRouter credit)

The new circle sizing, dedupe, quarters, Climb's 3 taught topics, the picture
reader and its cost, a free build end to end, and the monthly allowance
(check `/admin` shows the build under "This month", and the account page bar
moves). **The test:** rebuild the PHP
Unit 2 (the 3 PDFs) as a fresh subject. Check the circle count, that nothing
repeats, that the quarters vary, and the cost in `/admin`.

### Waiting on Isaac

1. Recharge OpenRouter, then run the smoke test above.
   Isaac's timing: within a day of 2026-09-25.
2. Stripe: **one more sandbox run first** (Isaac's call), then live: activate
   the account, add the live key, re-run the `/admin` setup, add a live
   webhook endpoint and its secret, turn on the customer portal, then one
   real payment and a refund.
3. Vercel Pro (Hobby is non-commercial only). Isaac is handling it, around
   when Stripe goes live.
4. Firebase Blaze and Storage, whenever billing goes through. The shelf turns
   on by itself.
5. Confirm the `google/gemini-3.1-flash-lite` slug exists on OpenRouter.

### Isaac's call (open)

- "From $1 a month" in the landing header reads as ongoing. It's $0.99 for the
  first month only.
- Confirm that a lapsed account gets no practice gym, and that its floor is
  the first 12 topics by oldest subject.
- The monthly allowance figures (§5): $0.50 free, $1 Climb, $4 Summit and
  Crew. Climb and Summit are about 40% of what each plan brings in after
  Stripe's cut. Crew matches Summit, which is nearer 80% of a seat's share.
  All were set before any real build had been costed. Revisit them
  after the smoke test and the first month of real users. The student copy
  when it runs out is in `lib/spend.ts`.

### Recommended next build

None queued. Next is the live smoke test, then launch.

### Coming up: onboarding and screen layout

Isaac will open this in a separate conversation. It's a strong renovation,
not a reinvention: same product, same flows, better presented. Wait for him
to lead it.

### After launch (set down on purpose; not gaps)

Build on demand (lessons, flashcards and MCQs made when tapped), the shelf's
forecast, the map's "what do I study now", a proper taster, the silent cut past
~60,000 characters, and server-side lesson locks.
