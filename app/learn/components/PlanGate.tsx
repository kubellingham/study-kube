"use client";

// Cram-gym gate (Climb). Practice, exams, notes and mistakes are Climb
// features; a no-tier account sees a warm unlock instead. UX only — the AI
// routes underneath are server-gated regardless.
import Link from "next/link";
import { useEntitlement } from "@/lib/use-entitlement";
import { hasClimb } from "@/lib/entitlement";

/** null = still deciding (render nothing / let the page show its own loader);
 *  true = locked (render <CramLocked/>); false = allowed. */
export function useCramLocked(): boolean | null {
  const { entitlement } = useEntitlement();
  if (entitlement === null) return null;
  return !hasClimb(entitlement);
}

export function CramLocked({ feature = "This" }: { feature?: string }) {
  return (
    <main className="mx-auto max-w-md flex-1 px-4 py-20 text-center">
      <div className="mx-auto grid place-items-center" style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--kube-soft)", color: "var(--kube)" }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0" strokeLinecap="round" /></svg>
      </div>
      <h1 className="mt-5 text-2xl">{feature} is part of Kube</h1>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
        The practice gym, mock exams and notes come with a Kube plan. Redeem a code (or start a plan) and it&apos;s all yours.
      </p>
      <Link href="/learn/upgrade" className="mt-6 inline-block rounded-2xl px-6 py-3 text-sm font-semibold text-white" style={{ background: "var(--kube)", boxShadow: "0 4px 0 rgba(20,32,43,.18)" }}>
        Unlock Kube
      </Link>
    </main>
  );
}
