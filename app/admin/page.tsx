"use client";

// Kube back office — owner only. Mint promo codes (16-char, A–Z + 2–9) that
// grant a tier for a set number of days, then hand them out. The owner's own
// access comes from redeeming one of these like anyone else. A passkey step-up
// on the mint action lands in a follow-up slice; today it's gated to the owner
// login (and re-checked server-side).
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/lib/use-user";
import { isOwner } from "@/lib/owner";
import { authedFetch } from "@/lib/authed-fetch";
import type { Tier } from "@/lib/entitlement";
import BrandLoader from "@/app/components/BrandLoader";

const K = { ink: "#16202b", inkSoft: "#46566a", faint: "#8593a3", bg: "#eef1f4", card: "#fff", line: "#dce2e8", kube: "#1f6f6b", kubeSoft: "#e2f0ef", kubeLine: "#b4d8d5", amber: "#d98a1f", red: "#c9463a", display: "'Fraunces',Georgia,serif", mono: "'JetBrains Mono',ui-monospace,monospace" };

interface CodeRow {
  code: string; tier: Tier; durationDays: number; maxUses: number; uses: number;
  recipientEmail: string | null; note: string; active: boolean; createdAt: number;
}

function fmtCode(c: string) {
  return c.replace(/(.{4})/g, "$1 ").trim();
}

export default function AdminPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [codes, setCodes] = useState<CodeRow[] | null>(null);
  const [tier, setTier] = useState<Tier>("summit");
  const [durationDays, setDurationDays] = useState(30);
  const [maxUses, setMaxUses] = useState(1);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [minted, setMinted] = useState<CodeRow | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const owner = isOwner(user?.email);

  const load = useCallback(() => {
    authedFetch("/api/admin/promo")
      .then((r) => r.json())
      .then((d) => setCodes(d.codes ?? []))
      .catch(() => setCodes([]));
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    if (owner) load();
  }, [user, loading, owner, router, load]);

  async function mint(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null); setMinted(null); setCopied(false);
    try {
      const res = await authedFetch("/api/admin/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier, durationDays, maxUses,
          recipientEmail: recipientEmail.trim() || null,
          note: note.trim(),
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to mint.");
      setMinted(d.code);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mint.");
    } finally {
      setBusy(false);
    }
  }

  if (loading || !user) return <BrandLoader />;

  if (!owner) {
    return (
      <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center", background: K.bg, fontFamily: "system-ui" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: K.inkSoft }}>This area is for the Kube owner.</p>
          <Link href="/learn" style={{ marginTop: 12, display: "inline-block", fontWeight: 600, color: K.kube }}>← back to Kube</Link>
        </div>
      </div>
    );
  }

  const label = (t: string) => <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: K.ink, margin: "0 0 6px" }}>{t}</label>;
  const field: React.CSSProperties = { width: "100%", borderRadius: 11, border: `1px solid ${K.line}`, background: "#fff", padding: "10px 12px", fontSize: 14, color: K.ink, outline: "none", fontFamily: "system-ui" };

  return (
    <main style={{ minHeight: "100dvh", background: K.bg, fontFamily: "system-ui", color: K.ink, padding: "28px 20px 80px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <span style={{ fontFamily: K.mono, fontSize: 11, fontWeight: 600, letterSpacing: ".16em", textTransform: "uppercase", color: K.kube }}>Back office</span>
            <h1 style={{ fontFamily: K.display, fontWeight: 600, fontSize: 30, letterSpacing: "-.02em", margin: "4px 0 0" }}>Promo codes</h1>
          </div>
          <Link href="/learn" style={{ fontSize: 13, fontWeight: 600, color: K.kube, textDecoration: "none" }}>← Kube</Link>
        </div>

        {/* Mint */}
        <form onSubmit={mint} style={{ background: K.card, border: `1px solid ${K.line}`, borderRadius: 18, padding: 22 }}>
          <h2 style={{ fontFamily: K.display, fontWeight: 600, fontSize: 18, margin: "0 0 16px" }}>Mint a code</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <div>
              {label("Tier")}
              <select value={tier} onChange={(e) => setTier(e.target.value as Tier)} style={field}>
                <option value="climb">Climb</option>
                <option value="summit">Summit</option>
                <option value="crew">Crew</option>
              </select>
            </div>
            <div>
              {label("Access length (days)")}
              <input type="number" min={1} value={durationDays} onChange={(e) => setDurationDays(+e.target.value)} style={field} />
            </div>
            <div>
              {label("Max uses")}
              <input type="number" min={1} value={maxUses} onChange={(e) => setMaxUses(+e.target.value)} style={field} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
            <div>
              {label("Send to (email, optional)")}
              <input type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} placeholder="friend@university.edu" style={field} />
            </div>
            <div>
              {label("Note (optional)")}
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. early-access #3" style={field} />
            </div>
          </div>
          {error && <p style={{ color: K.red, fontSize: 13, margin: "12px 0 0" }}>{error}</p>}
          <button type="submit" disabled={busy} style={{ marginTop: 16, background: K.kube, color: "#fff", border: "none", borderRadius: 12, padding: "11px 20px", fontWeight: 700, fontSize: 14, cursor: busy ? "default" : "pointer", opacity: busy ? 0.7 : 1, boxShadow: "0 4px 0 rgba(20,32,43,.18)" }}>
            {busy ? "Minting…" : "Mint code"}
          </button>

          {minted && (
            <div style={{ marginTop: 18, background: K.kubeSoft, border: `1px solid ${K.kubeLine}`, borderRadius: 14, padding: "16px 18px" }}>
              <div style={{ fontSize: 12, color: K.inkSoft }}>New {minted.tier} code · {minted.durationDays} days{minted.recipientEmail ? ` · for ${minted.recipientEmail}` : ""}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
                <span style={{ fontFamily: K.mono, fontSize: 22, fontWeight: 600, letterSpacing: ".08em", color: K.kube }}>{fmtCode(minted.code)}</span>
                <button
                  type="button"
                  onClick={() => { navigator.clipboard?.writeText(minted.code); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                  style={{ border: `1px solid ${K.kubeLine}`, background: "#fff", color: K.kube, borderRadius: 9, padding: "6px 12px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}
                >
                  {copied ? "Copied ✓" : "Copy"}
                </button>
              </div>
              <div style={{ fontSize: 11.5, color: K.faint, marginTop: 8 }}>
                Redeem it under &ldquo;Have a code?&rdquo; on your subjects page. (Email delivery turns on once a mail key is set.)
              </div>
            </div>
          )}
        </form>

        {/* List */}
        <h2 style={{ fontFamily: K.display, fontWeight: 600, fontSize: 18, margin: "28px 0 12px" }}>Minted codes</h2>
        <div style={{ background: K.card, border: `1px solid ${K.line}`, borderRadius: 16, overflow: "hidden" }}>
          {codes === null ? (
            <div style={{ padding: 20, color: K.faint, fontSize: 13 }}>Loading…</div>
          ) : codes.length === 0 ? (
            <div style={{ padding: 20, color: K.faint, fontSize: 13 }}>No codes yet — mint your first above.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: "left", color: K.faint, fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em" }}>
                  <th style={{ padding: "10px 14px" }}>Code</th>
                  <th style={{ padding: "10px 14px" }}>Tier</th>
                  <th style={{ padding: "10px 14px" }}>Days</th>
                  <th style={{ padding: "10px 14px" }}>Uses</th>
                  <th style={{ padding: "10px 14px" }}>For</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((c) => (
                  <tr key={c.code} style={{ borderTop: `1px solid ${K.line}`, opacity: c.active ? 1 : 0.5 }}>
                    <td style={{ padding: "10px 14px", fontFamily: K.mono, fontWeight: 600, letterSpacing: ".04em" }}>{fmtCode(c.code)}</td>
                    <td style={{ padding: "10px 14px", textTransform: "capitalize" }}>{c.tier}</td>
                    <td style={{ padding: "10px 14px" }}>{c.durationDays}</td>
                    <td style={{ padding: "10px 14px", color: c.uses >= c.maxUses ? K.amber : K.inkSoft }}>{c.uses}/{c.maxUses}</td>
                    <td style={{ padding: "10px 14px", color: K.inkSoft }}>{c.recipientEmail || c.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}
