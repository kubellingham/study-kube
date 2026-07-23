"use client";

// "Have a code?" — redeem a promo code for access. Uses the learn token scope
// (var(--kube) etc.). Calls onRedeemed() so the page can refresh entitlement.
import { useState } from "react";
import { authedFetch } from "@/lib/authed-fetch";
import { TIER_LABEL, type Tier } from "@/lib/entitlement";

export default function RedeemCode({ onRedeemed }: { onRedeemed?: () => void }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function redeem(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy(true); setMsg(null);
    try {
      const res = await authedFetch("/api/promo/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Could not redeem that code.");
      const when = new Date(d.expiresAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
      setMsg({ ok: true, text: `${TIER_LABEL[d.tier as Tier]} unlocked — yours through ${when}.` });
      setCode("");
      onRedeemed?.();
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Could not redeem that code." });
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border px-3.5 py-1.5 text-xs font-semibold"
        style={{ borderColor: "var(--kube-line)", color: "var(--kube)", background: "var(--kube-soft)" }}
      >
        Have a code?
      </button>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <form onSubmit={redeem} className="flex items-center gap-2">
        <input
          autoFocus
          value={code}
          onChange={(e) => { setCode(e.target.value.toUpperCase()); setMsg(null); }}
          placeholder="XXXX XXXX XXXX XXXX"
          maxLength={19}
          className="rounded-full border px-3.5 py-1.5 text-xs font-semibold outline-none"
          style={{ borderColor: "var(--line)", background: "var(--card)", color: "var(--ink)", fontFamily: "var(--font-mono)", letterSpacing: ".06em", width: 190 }}
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
          style={{ background: "var(--kube)" }}
        >
          {busy ? "…" : "Redeem"}
        </button>
        <button type="button" onClick={() => { setOpen(false); setMsg(null); }} className="text-xs" style={{ color: "var(--faint)" }}>
          ✕
        </button>
      </form>
      {msg && (
        <div
          className="absolute right-0 mt-2 rounded-xl border px-3 py-2 text-xs"
          style={{
            zIndex: 20, width: 240,
            borderColor: msg.ok ? "var(--kube-line)" : "var(--red)",
            background: msg.ok ? "var(--kube-soft)" : "var(--red-soft)",
            color: msg.ok ? "var(--kube)" : "var(--red)",
          }}
        >
          {msg.text}
        </div>
      )}
    </div>
  );
}
