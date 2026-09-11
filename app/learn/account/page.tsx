"use client";

// Account settings: sign out, or delete the account entirely. Delete wipes the
// user's data server-side (and records a ledger entry so a returning email
// can't reclaim the first-month intro price), then removes the Firebase Auth
// user client-side and returns to the landing.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, deleteUser } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useUser } from "@/lib/use-user";
import { authedFetch } from "@/lib/authed-fetch";

interface ReferralInfo {
  code: string;
  count: number;
  monthsGranted: number;
  toNextReward: number;
  perReward: number;
  rewardDays: number;
}

export default function AccountPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [referral, setReferral] = useState<ReferralInfo | null>(null);
  const [refCopied, setRefCopied] = useState<"code" | "link" | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    authedFetch("/api/user/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.referral) setReferral(d.referral as ReferralInfo);
      })
      .catch(() => {
        /* silent — referral card just doesn't render */
      });
  }, [user]);

  async function copy(text: string, kind: "code" | "link") {
    try {
      await navigator.clipboard.writeText(text);
      setRefCopied(kind);
      setTimeout(() => setRefCopied(null), 1500);
    } catch {
      /* clipboard blocked — the value is still visible for manual copy */
    }
  }

  if (loading || !user) {
    return <div className="flex-1 grid place-items-center text-sm" style={{ color: "var(--faint)" }}>Loading…</div>;
  }

  const confirmOk = confirm.trim().toUpperCase() === "DELETE";

  async function del() {
    setBusy(true);
    setErr(null);
    try {
      // 1) Wipe data + record the ledger (server, with a valid token).
      const res = await authedFetch("/api/account/delete", { method: "POST" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Could not delete the account.");
      // 2) Remove the Firebase Auth user (best effort — may need a recent login).
      try {
        const u = auth().currentUser;
        if (u) await deleteUser(u);
      } catch {
        // requires-recent-login etc. — data is already gone and the email is
        // recorded, so signing out is enough; the shell account carries nothing.
      }
      // 3) Home.
      await signOut(auth()).catch(() => {});
      window.location.assign("/");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not delete the account.");
      setBusy(false);
    }
  }

  const field: React.CSSProperties = {
    width: "100%", borderRadius: 12, border: "1px solid var(--line)", background: "var(--card)",
    padding: "12px 13px", fontSize: 14, color: "var(--ink)", outline: "none",
  };

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-24 pt-8">
      <div className="mb-6 flex items-center justify-between">
        <span className="k-eyebrow" style={{ color: "var(--kube)" }}>account</span>
        <Link href="/learn" className="text-xs font-semibold" style={{ color: "var(--faint)" }}>← your subjects</Link>
      </div>
      <h1 className="text-3xl">Your account</h1>
      {user.email && (
        <p className="mt-2 text-sm" style={{ color: "var(--ink-soft)", fontFamily: "var(--font-mono)" }}>{user.email}</p>
      )}

      {referral && (
        <div className="k-card mt-6 px-6 py-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Refer friends, earn free months</h2>
            <span className="k-eyebrow" style={{ color: "var(--kube)" }}>
              {referral.count} referred
            </span>
          </div>
          <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            Every {referral.perReward} friends who sign up with your code gets you {referral.rewardDays} free days of Summit.
            {referral.toNextReward === 1
              ? " One more friend to your next free month."
              : ` ${referral.toNextReward} more friends to your next free month.`}
            {referral.monthsGranted > 0 && (
              <>
                {" "}You&apos;ve already earned <b>{referral.monthsGranted} month{referral.monthsGranted === 1 ? "" : "s"}</b> — it&apos;s on your entitlement.
              </>
            )}
          </p>

          <div
            className="mt-4 flex items-center gap-3 rounded-2xl px-4 py-3"
            style={{ background: "var(--kube-soft)", border: "1px solid var(--kube-line)" }}
          >
            <span
              className="text-xl font-semibold"
              style={{ fontFamily: "var(--font-mono)", letterSpacing: ".18em", color: "var(--kube)" }}
            >
              {referral.code}
            </span>
            <button
              type="button"
              onClick={() => copy(referral.code, "code")}
              className="ml-auto rounded-lg border px-3 py-1.5 text-xs font-semibold"
              style={{ borderColor: "var(--kube-line)", color: "var(--kube)", background: "var(--card)" }}
            >
              {refCopied === "code" ? "Copied ✓" : "Copy code"}
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              const link = `${window.location.origin}/?ref=${referral.code}`;
              copy(link, "link");
            }}
            className="mt-3 w-full rounded-xl border px-4 py-2.5 text-sm font-semibold"
            style={{ borderColor: "var(--line)", color: "var(--ink)", background: "var(--card)" }}
          >
            {refCopied === "link" ? "Link copied ✓" : "Copy your invite link"}
          </button>

          <div className="mt-3 flex gap-1.5">
            {Array.from({ length: referral.perReward }, (_, i) => {
              const filled = i < referral.count % referral.perReward;
              return (
                <span
                  key={i}
                  aria-hidden
                  style={{
                    flex: 1,
                    height: 6,
                    borderRadius: 999,
                    background: filled ? "var(--kube)" : "var(--line)",
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      <div className="k-card mt-6 px-6 py-5">
        <h2 className="text-lg font-semibold">Sign out</h2>
        <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
          Sign out on this device. Your subjects stay right where they are.
        </p>
        <button
          type="button"
          onClick={async () => { await signOut(auth()); window.location.assign("/"); }}
          className="mt-4 rounded-xl border px-5 py-2.5 text-sm font-semibold"
          style={{ borderColor: "var(--line)", color: "var(--ink-soft)", background: "var(--card)" }}
        >
          Sign out
        </button>
      </div>

      <div className="mt-6 rounded-2xl border px-6 py-6" style={{ borderColor: "var(--red)", background: "var(--red-soft)" }}>
        <h2 className="text-lg font-semibold" style={{ color: "var(--red)" }}>Delete account</h2>
        <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
          Permanently deletes your account and everything in it — every subject, all your
          progress, practice and mistakes. This can&apos;t be undone. Type <b>DELETE</b> to confirm.
        </p>
        <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--faint)" }}>
          Note: for fairness, the first-month intro price is a once-per-person offer — deleting and
          signing up again won&apos;t bring it back.
        </p>
        <input
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="DELETE"
          className="mt-3"
          style={{ ...field, borderColor: "var(--red)" }}
        />
        {err && <p className="mt-2 text-sm" style={{ color: "var(--red)" }}>{err}</p>}
        <button
          type="button"
          onClick={del}
          disabled={!confirmOk || busy}
          className="mt-3 rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
          style={{ background: "var(--red)" }}
        >
          {busy ? "Deleting…" : "Delete my account"}
        </button>
      </div>
    </main>
  );
}
