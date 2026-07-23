import { NextRequest } from "next/server";
import type Stripe from "stripe";
import { adminDb } from "@/lib/firebase/admin";
import { stripe, stripeReady } from "@/lib/stripe";
import type { Tier } from "@/lib/entitlement";

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

async function apply(sub: Stripe.Subscription) {
  const uid = await uidForSubscription(sub);
  if (!uid) return;
  const tier = tierOf(sub);
  const active = sub.status === "active" || sub.status === "trialing";
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  await adminDb().collection("entitlements").doc(uid).set(
    {
      stripeTier: tier,
      stripeStatus: active ? "active" : sub.status,
      stripeExpiresAt: periodEndMs(sub),
      stripeSubId: sub.id,
      stripeCustomerId: customerId,
    },
    { merge: true }
  );
  // Reverse map for later customer-only events.
  await adminDb().collection("stripeCustomers").doc(customerId).set({ uid }, { merge: true });
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
  } catch {
    // Never 500 back to Stripe on a processing hiccup we can't fix by retrying —
    // ack the receipt; a later event reconciles state.
  }
  return Response.json({ received: true });
}
