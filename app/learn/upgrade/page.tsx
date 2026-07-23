"use client";

// Kube plans — the checkout surface the upsells point to. Climb + Summit
// (Crew's group billing is Phase 2b). Display copy is client-safe here; the
// real prices live in lib/stripe.ts and are enforced server-side at checkout.
import { useState } from "react";
import Link from "next/link";
import { authedFetch } from "@/lib/authed-fetch";

type Interval = "month" | "annual";

const PLANS = [
  {
    tier: "climb" as const,
    name: "Kube Climb",
    tagline: "Your course, fully broken down.",
    month: "$2.99", intro: "$0.99 first month", annual: "$29.99",
    features: ["Unlimited subjects & uploads", "The full practice gym — flashcards, matching, sprints", "Mock exams with instant feedback", "Notes, rewritten with love", "Your whole learning tree, laid out"],
    accent: "var(--kube)",
  },
  {
    tier: "summit" as const,
    name: "Kube Summit",
    tagline: "Climb your whole semester — with a tutor who pulls you through it.",
    month: "$9.99", intro: "$5.99 first month", annual: "$99.99",
    features: ["Everything in Climb", "Unlock the climb — the full four-quarter teaching", "Your daily plan, aligned to your exams", "The live AI tutor on your own material", "Progress tracking & personalization"],
    accent: "var(--amber)",
    featured: true,
  },
];

export default function UpgradePage() {
  const [interval, setInterval] = useState<Interval>("month");
  const [crewSize, setCrewSize] = useState<4 | 6>(6);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const crewPrice = crewSize === 4
    ? (interval === "month" ? "$23.99" : "$239.99")
    : (interval === "month" ? "$29.99" : "$299.99");

  async function choose(tier: "climb" | "summit" | "crew", size?: 4 | 6) {
    setBusy(size ? `crew${size}` : tier); setError(null);
    try {
      const res = await authedFetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, interval, ...(size ? { size } : {}) }),
      });
      const d = await res.json();
      if (!res.ok || !d.url) throw new Error(d.error || "Couldn't start checkout.");
      window.location.assign(d.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start checkout.");
      setBusy(null);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-24 pt-8">
      <div className="mb-6 flex items-center justify-between">
        <span className="k-eyebrow" style={{ color: "var(--kube)" }}>Kube plans</span>
        <Link href="/learn" className="text-xs font-semibold" style={{ color: "var(--faint)" }}>← your subjects</Link>
      </div>
      <h1 className="text-3xl">Pick your climb</h1>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
        Build for free — pay to climb. Cancel anytime.
      </p>

      {/* Interval toggle */}
      <div className="mt-6 inline-flex rounded-full p-1" style={{ background: "var(--bg-deep)" }}>
        {(["month", "annual"] as Interval[]).map((iv) => (
          <button
            key={iv}
            onClick={() => setInterval(iv)}
            className="rounded-full px-4 py-1.5 text-xs font-semibold"
            style={interval === iv ? { background: "var(--card)", color: "var(--kube)", boxShadow: "0 1px 3px rgba(15,32,50,.12)" } : { color: "var(--faint)" }}
          >
            {iv === "month" ? "Monthly" : "Yearly · ~2 months free"}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-sm" style={{ color: "var(--red)" }}>{error}</p>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {PLANS.map((p) => (
          <div key={p.tier} className="k-card flex flex-col px-6 py-6" style={p.featured ? { boxShadow: `0 0 0 2px ${p.accent}` } : undefined}>
            <div className="flex items-center gap-2">
              <h2 className="text-xl">{p.name}</h2>
              {p.featured && <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide" style={{ background: "var(--amber-soft)", color: "var(--amber)" }}>Most climb</span>}
            </div>
            <p className="mt-1 text-sm" style={{ color: "var(--ink-soft)" }}>{p.tagline}</p>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{interval === "month" ? p.month : p.annual}</span>
              <span className="text-sm" style={{ color: "var(--faint)" }}>/{interval === "month" ? "mo" : "yr"}</span>
            </div>
            {interval === "month" && <p className="mt-1 text-xs font-semibold" style={{ color: "var(--kube)" }}>{p.intro}</p>}

            <ul className="mt-4 flex-1 space-y-2">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm" style={{ color: "var(--ink-soft)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={p.accent} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none", marginTop: 2 }}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => choose(p.tier)}
              disabled={busy !== null}
              className="mt-5 w-full rounded-2xl py-3 text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: p.accent, boxShadow: "0 4px 0 rgba(20,32,43,.18)" }}
            >
              {busy === p.tier ? "Starting…" : `Choose ${p.name.replace("Kube ", "")}`}
            </button>
          </div>
        ))}
      </div>

      {/* Crew — group billing */}
      <div className="k-card mt-4 flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl">Kube Crew</h2>
            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide" style={{ background: "var(--kube-soft)", color: "var(--kube)" }}>Cheaper per head</span>
          </div>
          <p className="mt-1 text-sm" style={{ color: "var(--ink-soft)" }}>
            Everything in Summit for your whole crew, plus a shared library. You lead; you invite. ~${crewSize === 4 ? "6" : "5"}/head.
          </p>
          <div className="mt-3 inline-flex rounded-full p-1" style={{ background: "var(--bg-deep)" }}>
            {([4, 6] as const).map((n) => (
              <button key={n} onClick={() => setCrewSize(n)} className="rounded-full px-3.5 py-1.5 text-xs font-semibold" style={crewSize === n ? { background: "var(--card)", color: "var(--kube)", boxShadow: "0 1px 3px rgba(15,32,50,.12)" } : { color: "var(--faint)" }}>
                Up to {n}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{crewPrice}</span>
            <span className="text-sm" style={{ color: "var(--faint)" }}>/{interval === "month" ? "mo" : "yr"}</span>
          </div>
          <button
            onClick={() => choose("crew", crewSize)}
            disabled={busy !== null}
            className="w-full rounded-2xl px-6 py-3 text-sm font-semibold text-white disabled:opacity-60 sm:w-auto"
            style={{ background: "var(--kube)", boxShadow: "0 4px 0 rgba(20,32,43,.18)" }}
          >
            {busy === `crew${crewSize}` ? "Starting…" : "Choose Crew"}
          </button>
        </div>
      </div>

      <p className="mt-6 text-center text-xs" style={{ color: "var(--faint)" }}>
        In a crew already? <Link href="/learn/crew" style={{ color: "var(--kube)", fontWeight: 600 }}>Redeem an invite →</Link>
        {" · "}Have a code? <Link href="/learn" style={{ color: "var(--kube)", fontWeight: 600 }}>Redeem on your subjects →</Link>
      </p>
    </main>
  );
}
