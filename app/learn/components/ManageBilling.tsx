"use client";

// "Manage billing" — opens the Stripe customer portal (update card, cancel).
// Only shows for accounts whose access comes from a Stripe subscription.
import { useState } from "react";
import { useEntitlement } from "@/lib/use-entitlement";
import { authedFetch } from "@/lib/authed-fetch";

export default function ManageBilling() {
  const { entitlement } = useEntitlement();
  const [busy, setBusy] = useState(false);
  // A press that quietly does nothing is worse than one that fails out loud —
  // this button is the only way to change a card or cancel.
  const [error, setError] = useState<string | null>(null);
  if (entitlement?.source !== "stripe") return null;

  async function open() {
    setBusy(true);
    setError(null);
    try {
      const res = await authedFetch("/api/stripe/portal", { method: "POST" });
      const d = await res.json();
      if (res.ok && d.url) {
        window.location.assign(d.url);
        return;
      }
      setError(d.error || "Couldn't open billing just now — try again in a moment.");
    } catch {
      setError("Couldn't reach billing — check your connection and try again.");
    }
    setBusy(false);
  }

  return (
    <span>
      <button
        type="button"
        onClick={open}
        disabled={busy}
        className="rounded-full border px-3.5 py-1.5 text-xs font-semibold"
        style={{ borderColor: "var(--line)", color: "var(--ink-soft)", background: "var(--card)" }}
      >
        {busy ? "Opening…" : "Manage billing"}
      </button>
      {error && (
        <span className="ml-2 text-[11px] font-semibold" style={{ color: "var(--red)" }}>
          {error}
        </span>
      )}
    </span>
  );
}
