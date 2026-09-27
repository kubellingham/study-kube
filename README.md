# Studying Kube

A student gives Kube their course documents: PDFs, slides, notes, past papers,
photos. Kube builds each subject into a **ladder** of ordered units, or a
**map** of topic clusters. Every topic is a circle taught in short lessons,
with a practice gym, mock exams, a glossary, a mistakes book, flashcards and an
in-lesson tutor around it.

Live at **https://studying-kube.vercel.app**.

**Start with [`KUBE_STATE.md`](KUBE_STATE.md).** It's the single source of truth:
what the product is, the plans and what each gets, how a build works, models
and spend limits, payments, security, env vars, workflow, and what's waiting.
[`WALK.md`](WALK.md) is the running list of findings and decisions.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4. This is
  not the Next.js in most training data: read `node_modules/next/dist/docs/`
  before changing framework code.
- Firebase: Firestore and Auth. The server uses the Admin SDK and verifies ID
  tokens with `jose`.
- AI through OpenRouter (the build and chat models, plus a cheap picture
  reader). Anthropic is used only for the owner's premium test path.
- Stripe for subscriptions. Vercel for hosting.

## Run it locally

```bash
npm install
cp .env.example .env.local   # fill in the values; never commit .env.local
npm run dev                  # http://localhost:3000
```

The values `.env.local` needs are listed in `.env.example` and in
`KUBE_STATE.md` §8. Before any change, run `npx tsc --noEmit`,
`npx eslint <changed files>` and `npm run build`.

## Security rules

`firestore.rules` is deny-by-default: the browser may only touch a student's
own study records. Publish it from the Firebase console (Firestore → Rules) or
with `firebase deploy --only firestore:rules`.
