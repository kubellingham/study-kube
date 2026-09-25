// THE MONTHLY ALLOWANCE — how much AI one person may cost Kube in a month.
//
// Every account draws on the same OpenRouter balance. The per-minute limits
// (lib/rate-limit.ts) stop a burst; they don't stop someone who stays just
// under them all day, every day, and costs more than their plan brings in.
// This does. It counts real money — what each model call actually cost — per
// person, per calendar month, in Firestore, so it holds exactly across every
// server instance and survives restarts.
//
// Two rules keep it from ever feeling like a trap:
// - A build that has started always finishes. The check happens before
//   anything is spent; a build that crosses the line on its way is kept.
// - Studying outlives building. Once the month's building is used up, the
//   small helpers inside lessons (tutor, drill checks) keep going a while
//   longer — STUDY_GRACE — so nobody is cut off mid-lesson because a big
//   upload used the month.
//
// Nothing here ever throws into a caller. If the ledger can't be read or
// written, Kube lets the student through: a missed count costs a few cents; a
// false "you're out" costs a student.
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { isOwner } from "@/lib/owner";
import type { Entitlement } from "@/lib/entitlement";

const COLLECTION = "spend";

/** Model spend allowed per person per month, in USD — Kube's cost, not the
 *  price. Each is roughly a third to a half of what the plan brings in after
 *  Stripe's cut, so an account that uses all of it still leaves a margin.
 *  Isaac's call; each is a Vercel variable (a redeploy, no code change). */
const num = (v: string | undefined, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};
export const ALLOWANCE_USD = {
  /** Never paid, or a plan that lapsed. The 12 topics cost cents; this only
   *  bounds everything around them. */
  free: num(process.env.ALLOWANCE_FREE_USD, 0.5),
  climb: num(process.env.ALLOWANCE_CLIMB_USD, 1),
  summit: num(process.env.ALLOWANCE_SUMMIT_USD, 4),
  /** Per person in a crew. Crew is Summit for a group, so it defaults to the
   *  same — and someone who holds Summit AND joins a crew resolves to crew, so
   *  a lower figure here would make joining a crew take something away. */
  crew: num(process.env.ALLOWANCE_CREW_USD, num(process.env.ALLOWANCE_SUMMIT_USD, 4)),
};

/** How far past the allowance the in-lesson helpers keep working. */
export const STUDY_GRACE = 1.25;

/** Off switch for enforcement only: spend is still recorded either way. For
 *  the day a pricing change or a bad figure starts refusing people it
 *  shouldn't — flip it, fix, flip it back. */
const enforced = () => process.env.SPEND_ALLOWANCE !== "0";

export type SpendKind = "build" | "read" | "chat" | "note" | "drill" | "recheck" | "cards";

/** The calendar month a spend belongs to, in UTC: "2026-09". */
export const monthKey = (at = new Date()) => at.toISOString().slice(0, 7);

/** Midnight UTC on the 1st of next month, when every allowance refills. */
export function resetsAt(at = new Date()): number {
  return Date.UTC(at.getUTCFullYear(), at.getUTCMonth() + 1, 1);
}

/** "1 October" — the refill date, the way a student reads it. */
export function resetsLabel(at = new Date()): string {
  return new Date(resetsAt(at)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

/** This account's monthly allowance in USD. */
export function allowanceFor(e: Entitlement): number {
  if (e.tier === "crew") return ALLOWANCE_USD.crew;
  if (e.tier === "summit") return ALLOWANCE_USD.summit;
  if (e.tier === "climb") return ALLOWANCE_USD.climb;
  return ALLOWANCE_USD.free;
}

/** What this account has cost this month, in USD. */
export async function spentThisMonth(uid: string): Promise<number> {
  try {
    const snap = await adminDb().collection(COLLECTION).doc(uid).get();
    const d = snap.data();
    return d?.month === monthKey() && typeof d.usd === "number" ? d.usd : 0;
  } catch {
    return 0;
  }
}

/** Add a finished call's cost to the account's month. A new month starts from
 *  zero; the month just ended is kept under `history` for the back office. */
export async function recordSpend(uid: string, usd: number, kind: SpendKind): Promise<void> {
  if (!uid || !(usd > 0)) return;
  const month = monthKey();
  const ref = adminDb().collection(COLLECTION).doc(uid);
  try {
    await adminDb().runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const d = snap.data();
      if (d?.month === month) {
        tx.update(ref, {
          usd: FieldValue.increment(usd),
          [`byKind.${kind}`]: FieldValue.increment(usd),
          updatedAt: Date.now(),
        });
        return;
      }
      tx.set(
        ref,
        {
          month,
          usd,
          byKind: { [kind]: usd },
          updatedAt: Date.now(),
          ...(d?.month && typeof d.usd === "number"
            ? { history: { ...(d.history ?? {}), [d.month]: d.usd } }
            : {}),
        },
        { merge: false }
      );
    });
  } catch (err) {
    console.error("[spend] couldn't record", kind, usd, err);
  }
}

/** Where an account stands this month — for the account page. A share, not
 *  dollars: a student needs "how much is left", not what Kube paid for it. */
export async function allowanceStatus(
  uid: string,
  email: string | null,
  e: Entitlement
): Promise<{ usedShare: number; resetsAt: number } | null> {
  // Nothing to show where nothing is enforced.
  if (!enforced() || isOwner(email)) return null;
  const limit = allowanceFor(e);
  const spent = await spentThisMonth(uid);
  return {
    usedShare: limit > 0 ? Math.min(1, spent / limit) : 1,
    resetsAt: resetsAt(),
  };
}

/**
 * May this account spend more this month? Call it before any model call.
 *
 * - "build": building or reading material. Stops at the allowance.
 * - "study": the helpers inside a lesson. Stops at allowance × STUDY_GRACE.
 *
 * The owner is never stopped (demos and admin work), but is still counted.
 */
export async function checkAllowance(
  uid: string,
  email: string | null,
  e: Entitlement,
  use: "build" | "study"
): Promise<{ ok: true } | { ok: false; response: Response }> {
  if (!enforced() || isOwner(email)) return { ok: true };
  const limit = allowanceFor(e) * (use === "study" ? STUDY_GRACE : 1);
  const spent = await spentThisMonth(uid);
  if (spent < limit) return { ok: true };

  const when = resetsLabel();
  const room = e.tier === "summit" || e.tier === "crew" ? "" : " Or move up a plan for more room.";
  const error =
    use === "build"
      ? `You've used this month's building on your plan. It refills on ${when}. Everything you've built stays open, and you can keep studying it.${room}`
      : `Kube's help inside lessons is used up for this month. It's back on ${when}. Your lessons and practice still work.${room}`;
  return {
    ok: false,
    response: Response.json(
      { error, allowance: "spent", resetsAt: resetsAt() },
      { status: 429 }
    ),
  };
}
