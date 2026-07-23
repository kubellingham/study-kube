"use client";

// "Manage billing" — opens the Stripe customer portal (update card, cancel).
// Only shows for accounts whose access comes from a Stripe subscription.
import { useState } from "react";
import { useEntitlement } from "@/lib/use-entitlement";
import { authedFetch } from "@/lib/authed-fetch";

export default function ManageBilling() {
  const { entitlement } = useEntitlement();
  const [busy, setBusy] = useState(false);
  if (entitlement?.source !== "stripe") return null;

  async function open() {
    setBusy(true);
    try {
      const res = await authedFetch("/api/stripe/portal", { method: "POST" });
      const d = await res.json();
      if (res.ok && d.url) window.location.assign(d.url);
      else setBusy(false);
    } catch {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={open}
      disabled={busy}
      className="rounded-full border px-3.5 py-1.5 text-xs font-semibold"
      style={{ borderColor: "var(--line)", color: "var(--ink-soft)", background: "var(--card)" }}
    >
      {busy ? "Opening…" : "Manage billing"}
    </button>
  );
}
