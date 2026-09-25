// Kube's access model (shared client + server). A user's access is the BEST of
// their active grants — a redeemed promo code, a Stripe subscription, or a crew
// membership. The owner is NOT special-cased here: their access flows through a
// promo code like everyone else, so an expired code locks them exactly the same.
//
// Tiers (see KUBE_MONETIZATION_STRATEGY.md):
//   climb  — the cram gym: build subjects, practice hub, exams, notes, and the
//            learning tree shown-but-locked.
//   summit — everything in climb, plus the actual climb (deep teaching), the
//            daily pull, live AI tutor, tracking.
//   crew   — summit for a whole group + a shared library.

export type Tier = "climb" | "summit" | "crew";

/** What a brand-new account may build before it has paid anything: TOPICS, not
 *  files or pages. Topics are the only unit a student understands and the only
 *  one that tracks what a build actually costs — a small document is built
 *  whole, a big one is built as far as the allowance goes and says so. */
export const FREE_TOPIC_ALLOWANCE = 12;

export const TIER_RANK: Record<Tier, number> = { climb: 1, summit: 2, crew: 3 };

export type EntitlementSource = "promo" | "stripe" | "crew";

/** The free allowance, as it stands for this account. */
export interface FreeAllowance {
  /** Topics this account has already had built. */
  used: number;
  /** Topics it may build in total. */
  allowance: number;
  /** False once the account has ever held a paid grant. Someone whose plan
   *  lapsed doesn't fall back into the free tier — otherwise you could
   *  subscribe, build a whole semester, cancel, and keep it all open. */
  eligible: boolean;
}

export interface Entitlement {
  tier: Tier | null;
  source: EntitlementSource | null;
  /** Epoch ms when this grant lapses; null = no active grant (or never expires). */
  expiresAt: number | null;
  /** Present for accounts that have never paid. */
  free?: FreeAllowance;
  /** A lapsed account's floor: the circles that stay open after a plan ends,
   *  so nobody who has paid is ever left with less than a newcomer. */
  floor?: string[];
  /** This month's AI allowance, as a share used (0–1) and when it refills.
   *  Display only — the server checks the real figure on every paid call. */
  allowance?: { usedShare: number; resetsAt: number };
}

export const LOCKED: Entitlement = { tier: null, source: null, expiresAt: null };

/** One access grant from a single source, as stored on the user's doc. */
export interface Grant {
  tier: Tier;
  source: EntitlementSource;
  expiresAt: number | null; // null = open-ended (e.g. an active Stripe sub)
}

function active(g: Grant, now: number): boolean {
  return g.expiresAt == null || g.expiresAt > now;
}

/** Resolve the effective entitlement: the highest-ranked grant still active. */
export function resolveEntitlement(grants: Grant[], now: number): Entitlement {
  let best: Grant | null = null;
  for (const g of grants) {
    if (!active(g, now)) continue;
    if (!best || TIER_RANK[g.tier] > TIER_RANK[best.tier]) best = g;
  }
  return best ? { tier: best.tier, source: best.source, expiresAt: best.expiresAt } : LOCKED;
}

/** Does this entitlement clear a minimum tier? (crew ⊇ summit ⊇ climb.) */
export function meetsTier(e: Entitlement, min: Tier): boolean {
  return e.tier != null && TIER_RANK[e.tier] >= TIER_RANK[min];
}

/** Cram gym (build, practice, exams, notes, see the tree). */
export const hasClimb = (e: Entitlement) => meetsTier(e, "climb");
/** The actual climb: deep teaching, daily pull, live AI. */
export const hasSummit = (e: Entitlement) => meetsTier(e, "summit");

/** Topics this account can still have built for free. */
export const freeTopicsLeft = (e: Entitlement) =>
  e.tier === null && e.free?.eligible ? Math.max(0, e.free.allowance - e.free.used) : 0;

/** Can this account be taught — open a lesson and climb it?
 *
 *  Summit and above, always. And a free account, because what its allowance
 *  built is the real thing, fully taught, and stays theirs forever. It can't
 *  grow past the allowance, so there's nothing to give away by leaving it open
 *  — whereas re-locking someone's own finished work would be a betrayal.
 *
 *  Note this is NOT `> 0`: spending the allowance closes the door to building
 *  more, never to studying what's already built. */
export const mayClimb = (e: Entitlement) =>
  hasSummit(e) || (e.tier === null && !!e.free?.eligible);

/** How many taught circles Climb opens in every subject — the taste of what
 *  Summit does with the rest of it. */
export const CLIMB_TASTE = 3;

/**
 * Is this circle open to this account? The whole tier policy in one place:
 *
 *   What you were GIVEN stays. What you RENTED goes back when you stop renting.
 *
 * - Summit / Crew: every circle.
 * - A circle built on the free allowance is a gift, and a gift is never taken
 *   back — upgrading to Climb doesn't close your twelve, cancelling doesn't.
 * - Climb: the first three taught circles of each subject.
 * - Never paid: everything it has, since its allowance built all of it.
 * - Paid once, plan ended: the free floor — twelve circles — never less than a
 *   newcomer gets. Nothing is ever deleted; resubscribing opens it all again.
 *
 * `position` is the circle's index among the TAUGHT circles of its subject.
 */
export function circleOpen(
  e: Entitlement,
  circle: { id: string; gift?: boolean; kind?: string },
  position: number
): boolean {
  if (hasSummit(e)) return true;
  if (circle.kind === "review") return e.tier === "climb" || (e.tier === null && !!e.free?.eligible);
  if (circle.gift) return true;
  if (e.tier === "climb") return position < CLIMB_TASTE;
  if (e.tier === null) return e.free?.eligible ? true : !!e.floor?.includes(circle.id);
  return false;
}

export const TIER_LABEL: Record<Tier, string> = {
  climb: "Kube Climb",
  summit: "Kube Summit",
  crew: "Kube Crew",
};
