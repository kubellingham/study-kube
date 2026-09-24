"use client";

// /try — the front-door taster. A signed-out visitor climbs one REAL Kube
// lesson (from the public "How to Actually Study" course), feels the exact
// mechanics — teach cards, retrieval checks, warm praise, a flashcard — and
// only then meets the "keep it" wall: make a free account to keep this subject
// and the progress you just made. "Feel it, then keep it."
import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { authedFetch } from "@/lib/authed-fetch";
import { useUser } from "@/lib/use-user";
import { getBuiltinBundle } from "@/lib/course";
import { topicLessons, shuffledOptions } from "@/lib/course/lessons";
import { markLessonComplete } from "@/lib/learn/progress";
import type { CheckStep, TeachStep, Topic } from "@/lib/course/types";
import Rich, { RichInline } from "@/app/learn/components/Rich";
import Diagram from "@/app/learn/components/Diagram";

const TASTER_ID = "study101";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Phase = "intro" | "lesson" | "flashcard" | "keep";

function authError(code: string | undefined): string | null {
  switch (code) {
    case "auth/email-already-in-use":
      return "That email already has an account — try signing in instead.";
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "That email and password don't match.";
    case "auth/user-not-found":
      return "No account with that email yet — create one below.";
    case "auth/weak-password":
      return "Use at least 6 characters for your password.";
    case "auth/popup-closed-by-user":
      return null;
    default:
      return "Something went wrong. Please try again.";
  }
}

/* ------------------------------------------------------------- top bar --- */

function TryBar() {
  return (
    <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-4 pt-5">
      <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 22, letterSpacing: "-.02em", lineHeight: 1 }}>
        <span style={{ color: "var(--ink)" }}>Studying</span>
        <span style={{ color: "var(--kube)" }}>Kube</span>
      </span>
      <Link
        href="/"
        className="k-chip"
        style={{ textDecoration: "none", cursor: "pointer" }}
      >
        Sign in
      </Link>
    </div>
  );
}

/* -------------------------------------------------------------- teach ---- */

function TeachCard({ step, onNext }: { step: TeachStep; onNext: () => void }) {
  return (
    <div className="k-card k-rise px-6 py-6">
      {step.title && <h2 className="mb-3 text-xl">{step.title}</h2>}
      <Rich body={step.body} />
      {step.svg && <Diagram svg={step.svg} />}
      <button
        type="button"
        onClick={onNext}
        className="k-btn pri mt-6 w-full"
        style={{ padding: "12px 18px" }}
      >
        Continue
      </button>
    </div>
  );
}

/* -------------------------------------------------------------- check ---- */

function CheckCard({ step, onNext }: { step: CheckStep; onNext: () => void }) {
  const { options, answer } = useMemo(() => shuffledOptions(step), [step]);
  const [picked, setPicked] = useState<number | null>(null);
  const [wrong, setWrong] = useState<Set<number>>(new Set());
  const correct = picked === answer;

  return (
    <div className="k-card k-rise px-6 py-6">
      <span className="k-eyebrow">Your turn</span>
      <h2 className="mt-1 text-xl leading-snug">
        <RichInline text={step.prompt} />
      </h2>
      {step.code && <pre className="k-code mt-4">{step.code}</pre>}
      <div className="mt-5 flex flex-col gap-2.5">
        {options.map((opt, i) => {
          const isPicked = picked === i;
          const isWrong = wrong.has(i);
          const showCorrect = correct && i === answer;
          return (
            <button
              key={i}
              type="button"
              disabled={correct}
              onClick={() => {
                if (correct) return;
                if (i === answer) setPicked(i);
                else {
                  setPicked(i);
                  setWrong((w) => new Set(w).add(i));
                }
              }}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm ${isWrong && isPicked ? "k-shake" : ""}`}
              style={{
                borderColor: showCorrect ? "var(--kube)" : isWrong ? "var(--red-line)" : "var(--line)",
                background: showCorrect ? "var(--kube-soft)" : isWrong ? "var(--red-soft)" : "var(--card)",
                color: "var(--ink)",
                cursor: correct ? "default" : "pointer",
                opacity: correct && !showCorrect ? 0.55 : 1,
              }}
            >
              <span className="min-w-0 flex-1">
                <RichInline text={opt} />
              </span>
            </button>
          );
        })}
      </div>

      {correct ? (
        <div className="k-rise mt-5">
          <p className="text-sm leading-relaxed" style={{ color: "var(--kube)" }}>
            <RichInline text={step.praise} />
          </p>
          <button type="button" onClick={onNext} className="k-btn pri mt-4 w-full" style={{ padding: "12px 18px" }}>
            Continue
          </button>
        </div>
      ) : (
        picked !== null && (
          <p className="mt-4 text-sm" style={{ color: "var(--ink-soft)" }}>
            Not quite — have another look and try again.
          </p>
        )
      )}
    </div>
  );
}

/* ----------------------------------------------------------- flashcard --- */

function FlashcardCard({ topic, onNext }: { topic: Topic; onNext: () => void }) {
  const card = topic.flashcards?.[0];
  const [flipped, setFlipped] = useState(false);
  if (!card) {
    return (
      <div className="k-card k-rise px-6 py-6 text-center">
        <button type="button" onClick={onNext} className="k-btn pri" style={{ padding: "12px 26px" }}>
          Keep this — it&apos;s yours ▸
        </button>
      </div>
    );
  }
  return (
    <div className="k-card k-rise px-6 py-6">
      <span className="k-eyebrow">And it&apos;s already a flashcard</span>
      <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
        Everything you climb quietly becomes spaced-repetition practice. Tap to flip.
      </p>
      <button
        type="button"
        onClick={() => setFlipped((v) => !v)}
        className="mt-4 grid w-full place-items-center rounded-2xl border px-6 text-center"
        style={{
          minHeight: 168,
          borderColor: "var(--kube-line)",
          background: flipped ? "var(--kube-soft)" : "var(--card)",
          cursor: "pointer",
        }}
      >
        <span>
          <span className="k-eyebrow" style={{ color: "var(--kube)" }}>{flipped ? "Answer" : "Prompt"}</span>
          <span className="mt-2 block text-base leading-relaxed" style={{ color: "var(--ink)" }}>
            {flipped ? card.back : card.front}
          </span>
          {!flipped && <span className="mt-3 block text-xs" style={{ color: "var(--faint)" }}>tap to reveal</span>}
        </span>
      </button>
      <button type="button" onClick={onNext} className="k-btn pri mt-5 w-full" style={{ padding: "12px 18px" }}>
        Keep this — it&apos;s yours ▸
      </button>
    </div>
  );
}

/* -------------------------------------------------------------- page ----- */

export default function TryPage() {
  const router = useRouter();
  const { user } = useUser();
  const bundle = getBuiltinBundle(TASTER_ID, null);
  const topic = bundle?.ladder[0];

  const [phase, setPhase] = useState<Phase>("intro");
  const [stepIndex, setStepIndex] = useState(0);

  // Keep-it wall auth state.
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const seededRef = useRef(false);

  if (!bundle || !topic) {
    return (
      <main className="mx-auto grid min-h-[60vh] w-full max-w-2xl place-items-center px-4 text-sm" style={{ color: "var(--faint)" }}>
        The taster is unavailable right now. <Link href="/" style={{ color: "var(--kube)", marginLeft: 6 }}>Go home</Link>
      </main>
    );
  }

  const steps = topic.steps;
  const step = steps[stepIndex];

  function nextStep() {
    if (stepIndex + 1 < steps.length) {
      setStepIndex((i) => i + 1);
    } else {
      // Whole topic climbed — remember it locally so a returning visitor's
      // "keep it" seeds the same completion even if they refresh.
      try {
        window.localStorage.setItem(
          "kube.try.study101",
          JSON.stringify({ topicId: topic!.id, at: Date.now() })
        );
      } catch {
        /* ignore storage errors */
      }
      setPhase("flashcard");
    }
  }

  /** Write the climbed topic into the (now signed-in) user's real progress,
   *  then take them to their subjects. Idempotent. */
  async function seedAndGo() {
    const uid = auth().currentUser?.uid;
    if (uid && !seededRef.current) {
      seededRef.current = true;
      try {
        const lessons = topicLessons(topic!);
        for (let i = 0; i < lessons.length; i++) {
          await markLessonComplete(uid, TASTER_ID, topic!.id, lessons[i].id, i === lessons.length - 1);
        }
      } catch {
        /* progress is a nicety here — never block the redirect on it */
      }
    }
    router.replace("/learn");
  }

  async function doAuth(google: boolean) {
    setNote(null);
    if (!google) {
      if (!EMAIL_RE.test(email.trim())) return setNote("That doesn't look like an email address.");
      if (pw.length < 6) return setNote("Use at least 6 characters for your password.");
    }
    setBusy(true);
    try {
      await setPersistence(auth(), browserLocalPersistence).catch(() => {});
      if (google) {
        await signInWithPopup(auth(), new GoogleAuthProvider());
      } else if (mode === "signup") {
        await createUserWithEmailAndPassword(auth(), email.trim(), pw);
      } else {
        await signInWithEmailAndPassword(auth(), email.trim(), pw);
      }
      // Create the user doc / apply any captured referral (mirrors Landing).
      (async () => {
        let ref: string | null = null;
        try {
          const stash = window.localStorage.getItem("kube.ref");
          if (stash) {
            const parsed = JSON.parse(stash) as { code: string; capturedAt: number };
            if (Date.now() - parsed.capturedAt < 30 * 86_400_000) ref = parsed.code;
            window.localStorage.removeItem("kube.ref");
          }
        } catch {
          /* ignore */
        }
        try {
          const displayName = auth().currentUser?.displayName ?? (name.trim() || null);
          await authedFetch("/api/user/init", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ref, displayName }),
          });
        } catch {
          /* /me self-heals later */
        }
      })();
      await seedAndGo();
    } catch (err) {
      const msg = authError((err as { code?: string })?.code);
      if (msg) setNote(msg);
      setBusy(false);
    }
  }

  const progress = phase === "lesson" ? (stepIndex / steps.length) * 100 : phase === "intro" ? 0 : 100;

  return (
    <>
      <TryBar />
      {/* thin progress rail */}
      <div className="mx-auto mt-4 w-full max-w-2xl px-4">
        <div className="track">
          <div className="k-bar h-full rounded-full" style={{ width: `${progress}%`, background: "var(--kube)" }} />
        </div>
      </div>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-16 pt-4">
        {phase === "intro" && (
          <div className="k-card k-rise px-6 py-7 text-center">
            <span className="k-eyebrow" style={{ color: "var(--kube)" }}>A real lesson · no signup</span>
            <h1 className="mx-auto mt-2 max-w-md text-3xl leading-tight">Try Kube in about a minute.</h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
              Climb one real lesson from <b style={{ color: "var(--ink)" }}>How to Actually Study</b> — the science of learning
              things that stick. This is exactly how every Kube subject feels once you feed it your own material.
            </p>
            <div className="mx-auto mt-5 flex max-w-xs flex-col gap-2 text-left">
              {[
                "Short teach cards, in plain language",
                "Quick checks — you retrieve, we praise",
                "It turns into spaced-repetition practice",
              ].map((t) => (
                <span key={t} className="flex items-center gap-2 text-sm" style={{ color: "var(--ink-soft)" }}>
                  <span style={{ color: "var(--kube)" }}>✓</span> {t}
                </span>
              ))}
            </div>
            <button type="button" onClick={() => setPhase("lesson")} className="k-btn pri mt-6" style={{ padding: "12px 26px" }}>
              Start climbing ▸
            </button>
          </div>
        )}

        {phase === "lesson" && (
          <>
            <div className="mb-3 flex items-center justify-between">
              <span className="k-eyebrow">{bundle.course.code} · {topic.title}</span>
              <span className="text-xs" style={{ color: "var(--faint)" }}>
                Step {stepIndex + 1} of {steps.length}
              </span>
            </div>
            {step.kind === "teach" ? (
              <TeachCard key={stepIndex} step={step} onNext={nextStep} />
            ) : (
              <CheckCard key={stepIndex} step={step} onNext={nextStep} />
            )}
          </>
        )}

        {phase === "flashcard" && <FlashcardCard topic={topic} onNext={() => setPhase("keep")} />}

        {phase === "keep" && (
          <div className="k-card k-rise px-6 py-7">
            <div className="text-center">
              <span className="k-eyebrow" style={{ color: "var(--kube)" }}>You just climbed your first topic</span>
              <h1 className="mx-auto mt-2 max-w-md text-3xl leading-tight">Keep it — and your progress.</h1>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                Make a free account and <b style={{ color: "var(--ink)" }}>How to Actually Study</b> lands on your shelf,
                mid-climb, right where you left it. Then feed Kube your own PDFs and it builds a ladder like this for every subject.
              </p>
            </div>

            {user ? (
              <button type="button" onClick={seedAndGo} className="k-btn pri mx-auto mt-6 flex" style={{ padding: "12px 26px" }}>
                Go to your subjects ▸
              </button>
            ) : (
              <div className="mx-auto mt-6 max-w-sm">
                <div className="mb-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setMode("signup"); setNote(null); }}
                    className="k-btn flex-1"
                    style={{ padding: "9px 12px", background: mode === "signup" ? "var(--kube)" : "var(--card)", color: mode === "signup" ? "#fff" : "var(--ink-soft)", border: mode === "signup" ? "1px solid transparent" : "1px solid var(--line)" }}
                  >
                    Create account
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode("signin"); setNote(null); }}
                    className="k-btn flex-1"
                    style={{ padding: "9px 12px", background: mode === "signin" ? "var(--kube)" : "var(--card)", color: mode === "signin" ? "#fff" : "var(--ink-soft)", border: mode === "signin" ? "1px solid transparent" : "1px solid var(--line)" }}
                  >
                    I have one
                  </button>
                </div>

                <form
                  onSubmit={(e) => { e.preventDefault(); doAuth(false); }}
                  className="flex flex-col gap-2.5"
                >
                  {mode === "signup" && (
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name (optional)"
                      autoComplete="name"
                      className="rounded-2xl border px-4 py-3 text-sm outline-none"
                      style={{ borderColor: "var(--line)", background: "var(--card)", color: "var(--ink)" }}
                    />
                  )}
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    type="email"
                    autoComplete="email"
                    className="rounded-2xl border px-4 py-3 text-sm outline-none"
                    style={{ borderColor: "var(--line)", background: "var(--card)", color: "var(--ink)" }}
                  />
                  <input
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    placeholder="Password"
                    type="password"
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    className="rounded-2xl border px-4 py-3 text-sm outline-none"
                    style={{ borderColor: "var(--line)", background: "var(--card)", color: "var(--ink)" }}
                  />
                  {note && <p className="text-sm" style={{ color: "var(--red)" }}>{note}</p>}
                  <button type="submit" disabled={busy} className="k-btn pri" style={{ padding: "12px 18px" }}>
                    {busy ? "One moment…" : mode === "signup" ? "Create account & keep it" : "Sign in & keep it"}
                  </button>
                </form>

                <div className="my-4 flex items-center gap-3">
                  <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
                  <span className="text-xs" style={{ color: "var(--faint)" }}>or</span>
                  <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
                </div>
                <button type="button" onClick={() => doAuth(true)} disabled={busy} className="k-btn gho w-full" style={{ padding: "12px 18px" }}>
                  Continue with Google
                </button>
                {/* This wall creates a real account, so it owes the same line
                    the landing page gives — and a way to actually read them. */}
                <p className="mt-4 text-center text-xs leading-relaxed" style={{ color: "var(--faint)" }}>
                  Free to start. No card needed. Your taster progress comes with you.
                  <br />
                  By continuing you agree to our{" "}
                  <a href="/legal" target="_blank" rel="noopener" style={{ color: "var(--ink-soft)", textDecoration: "underline" }}>
                    Terms &amp; Privacy Policy
                  </a>
                  .
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
