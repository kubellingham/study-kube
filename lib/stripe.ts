import Stripe from "stripe";
import type { Tier } from "@/lib/entitlement";

// Server-side Stripe. STRIPE_SECRET_KEY (sk_...) lives in Vercel env, never in
// the repo. The publishable key is NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.
let _stripe: Stripe | null = null;
export function stripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe is not configured (STRIPE_SECRET_KEY missing).");
  if (!_stripe) _stripe = new Stripe(key);
  return _stripe;
}
export const stripeReady = () => !!process.env.STRIPE_SECRET_KEY;

export type Interval = "month" | "annual";

// Prices from KUBE_MONETIZATION_STRATEGY.md, in cents. Crew's group billing is
// a separate mechanic (leader-pays, seats) — Phase 2b; v1 ships Climb + Summit.
export const PLANS: Record<
  "climb" | "summit",
  { tier: Tier; name: string; blurb: string; month: number; annual: number; introMonth: number }
> = {
  climb: {
    tier: "climb",
    name: "Kube Climb",
    blurb: "The cram gym — practice, mock exams, notes, and your whole course tree laid out.",
    month: 299,
    annual: 2999,
    introMonth: 99, // first month
  },
  summit: {
    tier: "summit",
    name: "Kube Summit",
    blurb: "Everything, unlocked — the full climb, your daily plan, and the live tutor.",
    month: 999,
    annual: 9999,
    introMonth: 599, // first month
  },
};

export const lookupKey = (tier: "climb" | "summit", interval: Interval) => `${tier}_${interval}`;
export const introCouponId = (tier: "climb" | "summit") => `${tier}_intro`;

// Kube Crew — group billing (leader pays, everyone gets Summit + a shared
// library). Two seat sizes; annual ≈ 2 months free. No intro coupon.
export type CrewSize = 4 | 6;
export const CREW = {
  tier: "crew" as Tier,
  name: "Kube Crew",
  blurb: "Everything in Summit for your whole crew, plus a shared material library — cheaper per head.",
  sizes: {
    4: { month: 2399, annual: 23999 },
    6: { month: 2999, annual: 29999 },
  } as Record<CrewSize, { month: number; annual: number }>,
};
export const crewLookup = (size: CrewSize, interval: Interval) => `crew${size}_${interval}`;
export const CREW_SIZES: CrewSize[] = [4, 6];

export const usd = (cents: number) =>
  cents % 100 === 0 ? `$${cents / 100}` : `$${(cents / 100).toFixed(2)}`;
