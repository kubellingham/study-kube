# The walk

Notes from walking Kube the way a stranger does — sign up, make a subject, feed
it, study it, pay for it — looking for what's **broken, untrue, or built but
unreachable**. Not a wishlist. If a finding needs a new idea to fix, it isn't a
finding: it goes to "after launch" at the bottom.

The whole picture (product, plans, pipeline, what's waiting) lives in
`KUBE_STATE.md`. This file is only the findings.

Three buckets:

- **Fix on sight** — broken, untrue, or unreachable. No discussion needed.
- **Fixed** — done, with the PR.
- **Isaac's call** — copy, pricing, tone, taste. Noted, untouched, decided in
  one sitting.

---

## Isaac's call

Nothing here is a bug. Each one is a judgement about what Kube should say or
promise, which is the founder's, not the builder's.

### 1. "From $1 a month" — landing header

The price is $0.99 for the **first month**, then $2.99. The same page says it
correctly further down ("$1 your first month"). The header reads as an ongoing
price.

### ~~2. The taster promises something the app refuses~~ — settled

Free now builds 12 topics for real (#45), so the promise is true.

### ~~3. The locked ladder~~ — settled

Climb now teaches the first 3 topics of every subject in full (#48).

---

## Fixed

| What | Where it showed | PR |
|---|---|---|
| A digest could freeze forever mid-build | "Drilling circles — 11/25 done…", stuck | #35 |
| A part-built file couldn't be finished | Re-adding it was refused as "already learned" | #35 |
| A map was built shallower than a ladder | Fewer topics for the same file, on Climb | #35 |
| "Hold it" offered with nowhere to hold | Shelf button errored while Storage is off | #37 |
| A map couldn't reach the glossary or mistakes book | Both built, nothing linked to them | #38 |
| Every map topic looked open to a locked account | Upgrade wall only appeared after the tap | #38 |
| "Unit 3" over theme clusters; "Unit 999" for Extras | Glossary, mock exam, practice | #38 |
| Terms & Privacy links went nowhere at sign-up | Landing sign-up panel | #39 |
| "Your account" said nothing about your plan | Account page | #39 |
| "Manage billing" failed silently | The one control that cancels a subscription | #39 |
| The taster's sign-up had no terms line at all | /try keep-it wall | #40 |
| Nobody handed a crew code could find where to enter it | Crew link hidden unless already in a crew | #40 |
| Anyone could write their own paid access from the browser | Firestore rules let a user create any document | #41 |
| Redeeming a code and joining a crew had no rate limit | Both endpoints, unlimited tries | #41 |
| Link previews pointed at a domain we don't own | Page metadata said kube.study | #43 |
| A second subscription erased the first | Buy Summit while leading a crew, cancel it, lose the crew | #44 |
| A few photos made a build cost ~$2.60 | Every picture re-sent to a vision model on every call | #49 |
| The tutor chat, definition checks, re-marking and the upload read had no per-person limit | One account or script could drain the shared AI balance | #50 |
| The retired /materials AI routes still answered anyone signed in | Summary, quiz, flashcards and tutor, with no plan check | #50 |

---

## Waiting on Isaac

- **Delete the legacy pages.** `app/dashboard`, `app/materials`,
  `app/components/Header.tsx`, and the five API routes only they call
  (`/api/materials`, `/api/flashcards`, `/api/quiz`, `/api/summary`,
  `/api/tutor` — three of which spend AI money), plus
  `lib/ingest/{index,pdf,text,youtube,article}.ts` and `lib/types.ts`. All
  verified unreachable. The sandbox blocked the deletion as irreversible; it
  needs permission.
- **OpenRouter credit.** Without it every upload fails, for everyone.
- **Go live on Stripe** when the account is activated: live key, re-run the
  `/admin` setup, a new webhook endpoint with its own secret, the customer
  portal turned on, then one real payment and a refund. The whole flow is
  already proven end to end in the sandbox — checkout, webhook, plan, portal,
  cancel.
- **Firebase Storage / Blaze**, whenever the billing address goes through. The
  shelf stays hidden until then and needs no code change.

---

## Decided

- **What a circle is.** One idea a lecturer would put on the syllabus, or an exam
  would ask about by name. Depth lives inside it, in its quarters — never in
  extra circles. Every named thing in the material is assigned to exactly one
  circle's `covers`, so fewer circles never means less taught. (This replaces
  the earlier "every named licence is its own circle" rule on purpose.)
- **Free = 12 topics.** Counted in circles as defined above; built in full;
  kept forever. A nearly-spent allowance never builds a fragment of a bigger
  document — below 3 remaining, Kube says what's in it and builds nothing.
- **Tiers, and what happens on change.** Upgrading never takes anything away;
  downgrading returns you to that tier's rights. Cancelling drops you to the
  free floor, never below it. Nothing is ever deleted. Climb gets 3 taught
  topics per subject as the taste of Summit. *(Built in #48. The one caveat:
  a lapsed account keeps its floor of topics but not the practice gym.)*
- **Quarters.** Light 2-3, medium 4, heavy up to 6 — extra quarters go where
  the difficulty is. Bigger circles, fewer of them. *(Built in #47.)*

## After launch

Ideas that came up and were deliberately set down. They are not gaps.

- The shelf's forecast — "here's what this becomes" before you spend a build.
- The map's "what do I study now" — the ladder answers it, the map doesn't.
- The taster, made properly good rather than adequate.
- The silent cut: material past ~60,000 characters is dropped without a word.
