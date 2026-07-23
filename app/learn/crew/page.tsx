"use client";

// Kube Crew — the group hub. If you lead a crew (you bought Crew), share your
// invite code; members join with it and get full access while your plan is
// active. If you're in someone's crew, see whose and leave anytime. Anyone can
// redeem an invite code here.
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/use-user";
import { authedFetch } from "@/lib/authed-fetch";

interface Leader { inviteCode: string; size: number; count: number }
interface Member { leaderEmail: string | null; size: number; count: number }

function fmt(c: string) { return c.replace(/(.{4})/g, "$1 ").trim(); }

export default function CrewPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [leader, setLeader] = useState<Leader | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [ready, setReady] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(() => {
    authedFetch("/api/crew")
      .then((r) => r.json())
      .then((d) => { setLeader(d.leader); setMember(d.member); setReady(true); })
      .catch(() => setReady(true));
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    load();
  }, [user, loading, router, load]);

  async function join(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy(true); setMsg(null);
    try {
      const res = await authedFetch("/api/crew/join", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Could not join.");
      setMsg({ ok: true, text: "You're in — Summit access unlocked with your crew." });
      setCode("");
      load();
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Could not join." });
    } finally { setBusy(false); }
  }

  async function leave() {
    setBusy(true); setMsg(null);
    try {
      await authedFetch("/api/crew/leave", { method: "POST" });
      load();
    } finally { setBusy(false); }
  }

  if (loading || !user || !ready) {
    return <div className="flex-1 grid place-items-center text-sm" style={{ color: "var(--faint)" }}>Loading your crew…</div>;
  }

  const card: React.CSSProperties = { background: "var(--card)", border: "1px solid var(--line)", borderRadius: 20, padding: "24px" };

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-24 pt-8">
      <div className="mb-6 flex items-center justify-between">
        <span className="k-eyebrow" style={{ color: "var(--kube)" }}>Kube Crew</span>
        <Link href="/learn" className="text-xs font-semibold" style={{ color: "var(--faint)" }}>← your subjects</Link>
      </div>
      <h1 className="text-3xl">Your crew</h1>

      {leader ? (
        <div className="mt-6" style={card}>
          <div className="text-sm font-semibold" style={{ color: "var(--kube)" }}>You lead this crew</div>
          <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            Share this code. Anyone who redeems it gets full Summit access while your plan is active.
          </p>
          <div className="mt-4 flex items-center gap-3 rounded-2xl px-4 py-4" style={{ background: "var(--kube-soft)", border: "1px solid var(--kube-line)" }}>
            <span className="text-2xl font-semibold" style={{ fontFamily: "var(--font-mono)", letterSpacing: ".08em", color: "var(--kube)" }}>{fmt(leader.inviteCode)}</span>
            <button
              type="button"
              onClick={() => { navigator.clipboard?.writeText(leader.inviteCode); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              className="ml-auto rounded-lg border px-3 py-1.5 text-xs font-semibold"
              style={{ borderColor: "var(--kube-line)", color: "var(--kube)", background: "var(--card)" }}
            >{copied ? "Copied ✓" : "Copy"}</button>
          </div>
          <div className="mt-3 text-sm" style={{ color: "var(--ink-soft)" }}>
            <span className="font-semibold" style={{ color: "var(--ink)" }}>{leader.count}</span> of {leader.size} seats used
            {leader.count < leader.size && <span style={{ color: "var(--faint)" }}> · {leader.size - leader.count} still open</span>}
          </div>
        </div>
      ) : member ? (
        <div className="mt-6" style={card}>
          <div className="text-sm font-semibold" style={{ color: "var(--kube)" }}>You&apos;re in a crew</div>
          <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            Full access, courtesy of {member.leaderEmail || "your crew leader"}. {member.count} of {member.size} seats used.
          </p>
          <button onClick={leave} disabled={busy} className="mt-4 rounded-xl border px-4 py-2 text-sm font-semibold disabled:opacity-60" style={{ borderColor: "var(--line)", color: "var(--ink-soft)" }}>
            Leave crew
          </button>
        </div>
      ) : (
        <div className="mt-6" style={card}>
          <div className="text-sm font-semibold" style={{ color: "var(--ink)" }}>Study together, cheaper per head</div>
          <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            Start a crew and everyone you invite gets full Summit access — or join one with a code below.
          </p>
          <Link href="/learn/upgrade" className="mt-4 inline-block rounded-xl px-4 py-2 text-sm font-semibold text-white" style={{ background: "var(--kube)" }}>
            Get Kube Crew
          </Link>
        </div>
      )}

      {/* Join box — for anyone who isn't already leading a crew */}
      {!leader && (
        <div className="mt-4" style={card}>
          <div className="text-sm font-semibold" style={{ color: "var(--ink)" }}>{member ? "Switch crews" : "Have an invite code?"}</div>
          <form onSubmit={join} className="mt-3 flex items-center gap-2">
            <input
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setMsg(null); }}
              placeholder="XXXX XXXX"
              maxLength={9}
              className="flex-1 rounded-xl border px-3.5 py-2.5 text-sm font-semibold outline-none"
              style={{ borderColor: "var(--line)", background: "var(--card)", color: "var(--ink)", fontFamily: "var(--font-mono)", letterSpacing: ".08em" }}
            />
            <button type="submit" disabled={busy} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60" style={{ background: "var(--kube)" }}>
              {busy ? "…" : "Join"}
            </button>
          </form>
          {msg && <p className="mt-2 text-xs" style={{ color: msg.ok ? "var(--kube)" : "var(--red)" }}>{msg.text}</p>}
        </div>
      )}
    </main>
  );
}
