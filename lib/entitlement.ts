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

export const TIER_RANK: Record<Tier, number> = { climb: 1, summit: 2, crew: 3 };

export type EntitlementSource = "promo" | "stripe" | "crew";

export interface Entitlement {
  tier: Tier | null;
  source: EntitlementSource | null;
  /** Epoch ms when this grant lapses; null = no active grant (or never expires). */
  expiresAt: number | null;
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

export const TIER_LABEL: Record<Tier, string> = {
  climb: "Kube Climb",
  summit: "Kube Summit",
  crew: "Kube Crew",
};
