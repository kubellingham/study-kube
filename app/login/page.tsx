"use client";

import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        await createUserWithEmailAndPassword(auth(), email, password);
      } else {
        await signInWithEmailAndPassword(auth(), email, password);
      }
      window.location.assign("/learn");
    } catch (err) {
      setError(friendlyError(err));
      setBusy(false);
    }
  }

  async function google() {
    setError(null);
    setBusy(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth(), provider);
      window.location.assign("/learn");
    } catch (err) {
      setError(friendlyError(err));
      setBusy(false);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Studying Kube</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Your AI study companion — summaries, flashcards, quizzes &amp; a tutor.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex rounded-lg bg-slate-100 p-1 text-sm dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`flex-1 rounded-md py-1.5 font-medium ${
                mode === "signin"
                  ? "bg-white shadow dark:bg-slate-700"
                  : "text-slate-500"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-md py-1.5 font-medium ${
                mode === "signup"
                  ? "bg-white shadow dark:bg-slate-700"
                  : "text-slate-500"
              }`}
            >
              Sign up
            </button>
          </div>

          <button
            type="button"
            onClick={google}
            disabled={busy}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            <GoogleG />
            Continue with Google
          </button>

          <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            or use email
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          </div>

          <form onSubmit={submit}>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 mb-4 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700"
              placeholder="you@example.com"
            />

            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 mb-4 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700"
              placeholder="••••••••"
            />

            {error && (
              <p className="mb-3 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
            >
              {busy
                ? "Please wait…"
                : mode === "signin"
                  ? "Sign in"
                  : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

function friendlyError(err: unknown): string {
  const code =
    typeof err === "object" && err && "code" in err
      ? String((err as { code: string }).code)
      : "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Invalid email or password.";
    case "auth/email-already-in-use":
      return "That email already has an account — try signing in.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/invalid-email":
      return "That doesn't look like a valid email.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Sign-in was cancelled.";
    case "auth/popup-blocked":
      return "Your browser blocked the sign-in popup — allow popups and try again.";
    case "auth/account-exists-with-different-credential":
      return "You already signed up with this email using a different method. Use that one.";
    case "auth/operation-not-allowed":
      return "Google sign-in isn't enabled yet. Enable it in Firebase Auth → Sign-in method.";
    case "auth/unauthorized-domain":
      return "This domain isn't authorized for sign-in. Add it in Firebase Auth → Settings → Authorized domains.";
    default:
      return err instanceof Error ? err.message : "Something went wrong.";
  }
}
