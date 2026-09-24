import { NextRequest } from "next/server";
import type Stripe from "stripe";
import { adminDb } from "@/lib/firebase/admin";
import { stripe, stripeReady, type CrewSize } from "@/lib/stripe";
import { TIER_RANK, type Tier } from "@/lib/entitlement";
import { provisionCrew } from "@/lib/crew";

/** One subscription's state, as stored under entitlements/{uid}.stripeSubs. */
type StoredSub = { tier: Tier | null; status: string; expiresAt: number | null };

/** Of everything Stripe says this account holds, the subscription that grants
 *  the most right now — or null when none of them is active. */
function bestActive(subs: Record<string, StoredSub>): { id: string; sub: StoredSub } | null {
  let best: { id: string; sub: StoredSub } | null = null;
  for (const [id, sub] of Object.entries(subs)) {
    if (!sub || sub.status !== "active" || !sub.tier) continue;
    if (!best || TIER_RANK[sub.tier] > TIER_RANK[best.sub.tier as Tier]) best = { id, sub };
  }
  return best;
}

export const runtime = "nodejs";

// Stripe → Kube. Verifies the signature with STRIPE_WEBHOOK_SECRET, then mirrors
// the subscription's state onto entitlements/{uid} (which the resolver reads).
// The raw body is required for signature verification, so we read req.text().

async function uidForSubscription(sub: Stripe.Subscription): Promise<string | null> {
  const metaUid = (sub.metadata?.uid as string | undefined) || undefined;
  if (metaUid) return metaUid;
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const map = await adminDb().collection("stripeCustomers").doc(customerId).get();
  return (map.data()?.uid as string | undefined) ?? null;
}

function tierOf(sub: Stripe.Subscription): Tier | null {
  const item = sub.items?.data?.[0];
  const price = item?.price;
  const t = (sub.metadata?.tier as string | undefined) || (price?.metadata?.tier as string | undefined) || price?.lookup_key?.split("_")[0];
  return t === "climb" || t === "summit" || t === "crew" ? (t as Tier) : null;
}

function periodEndMs(sub: Stripe.Subscription): number | null {
  const raw =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (sub as any).current_period_end ?? sub.items?.data?.[0]?.current_period_end;
  return typeof raw === "number" ? raw * 1000 : null;
}

function crewSizeOf(sub: Stripe.Subscription): CrewSize {
  const raw = (sub.metadata?.size as string | undefined) || (sub.items?.data?.[0]?.price?.metadata?.size as string | undefined);
  return raw === "4" ? 4 : 6;
}

async function apply(sub: Stripe.Subscription) {
  const uid = await uidForSubscription(sub);
  if (!uid) return;
  const tier = tierOf(sub);
  const active = sub.status === "active" || sub.status === "trialing";
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;

  // An account can hold more than one subscription — someone who buys Climb and
  // later buys Summit outright, or a crew leader who also subscribes for
  // themselves. Storing a single "current" subscription meant the newest event
  // overwrote the others: buy Summit while leading a crew and the crew record
  // vanished; cancel that Summit later and the crew access went with it, while
  // the crew subscription was still being paid for.
  //
  // Every subscription is now kept under its own id, and the flat fields are a
  // mirror of whichever one currently grants the most. Written in a transaction
  // because Stripe can deliver two events at once.
  const ref = adminDb().collection("entitlements").doc(uid);
  await adminDb().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const prior = (snap.data()?.stripeSubs ?? {}) as Record<string, StoredSub>;
    const subs: Record<string, StoredSub> = {
      ...prior,
      [sub.id]: {
        tier,
        status: active ? "active" : sub.status,
        expiresAt: periodEndMs(sub),
      },
    };
    const best = bestActive(subs);
    tx.set(
      ref,
      {
        stripeSubs: subs,
        // The flat fields describe the subscription that grants access today,
        // or the latest event when none of them does. Every existing reader
        // keeps working unchanged.
        stripeTier: best ? best.sub.tier : null,
        stripeStatus: best ? "active" : sub.status,
        stripeExpiresAt: best ? best.sub.expiresAt : periodEndMs(sub),
        stripeSubId: best ? best.id : sub.id,
        stripeCustomerId: customerId,
      },
      { merge: true }
    );
  });
  // Reverse map for later customer-only events.
  await adminDb().collection("stripeCustomers").doc(customerId).set({ uid }, { merge: true });

  // Crew: provision (or wind down) the group so members can join / lose access.
  if (tier === "crew") await provisionCrew(uid, null, crewSizeOf(sub), active);
}

export async function POST(req: NextRequest) {
  if (!stripeReady()) return Response.json({ error: "Stripe not configured." }, { status: 400 });
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return Response.json({ error: "Webhook secret not set." }, { status: 400 });

  const sig = req.headers.get("stripe-signature");
  if (!sig) return Response.json({ error: "Missing signature." }, { status: 400 });
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    return Response.json({ error: `Signature check failed: ${err instanceof Error ? err.message : ""}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.subscription) {
          const sub = await stripe().subscriptions.retrieve(
            typeof session.subscription === "string" ? session.subscription : session.subscription.id
          );
          await apply(sub);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await apply(event.data.object as Stripe.Subscription);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    // A transient failure (Stripe fetch, Firestore) must NOT be acked — else the
    // entitlement never gets written and the paid user is silently locked out
    // with no retry. Return 500 so Stripe retries this event.
    return Response.json(
      { error: `Processing failed: ${err instanceof Error ? err.message : "unknown"}` },
      { status: 500 }
    );
  }
  return Response.json({ received: true });
}
