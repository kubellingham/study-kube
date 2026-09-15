// Kube referral program — refer 3 friends, get 1 free month of Summit.
//
// Data model:
//   users/{uid}
//     referralCode: string        — 6 chars from the ambiguous-safe alphabet
//     referredBy: string | null   — the uid of the referrer (set once, on first init)
//     referralCount: number       — how many people have signed up with this user's code
//     referralMonthsGranted: number — how many free months we've already handed out (
//                                     for idempotency across the every-3 threshold)
//     createdAt: number
//     updatedAt: number
//
//   referralCodes/{code}          — reverse lookup so a code → uid is one read
//     uid: string
//
// The reward: every third confirmed referral extends the referrer's promo grant
// by 30 days on the same `promoTier`/`promoExpiresAt` fields that redeemPromoCode
// writes to. Uses a Firestore transaction to stay idempotent — a duplicate
// /api/user/init call can't double-grant.

import { randomInt } from "crypto";
import { adminDb } from "@/lib/firebase/admin";
import type { Tier } from "@/lib/entitlement";

// Same alphabet the promo codes use — 0/O and 1/I are omitted so a hand-typed
// code is unambiguous. 6 chars is enough for millions of users (32^6 = ~1B).
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LEN = 6;

const REFERRALS_PER_REWARD = 3;
const REWARD_DAYS = 30;
const REWARD_TIER: Tier = "summit";

export interface UserDoc {
  uid: string;
  referralCode: string;
  referredBy: string | null;
  referralCount: number;
  referralMonthsGranted: number;
  /** Captured on first init so the referrer can see who joined via their code
   *  without a separate auth-admin call (firebase-admin/auth can't run on
   *  Vercel here). Nullable — a user who hasn't signed in since we added
   *  this field just shows as "A friend" in the list. */
  email: string | null;
  displayName: string | null;
  createdAt: number;
  updatedAt: number;
}

/** Referrer-visible summary of someone who joined via the referrer's code. */
export interface ReferredJoin {
  uid: string;
  displayName: string | null;
  email: string | null;
  joinedAt: number;
}

function randomCode(): string {
  let s = "";
  for (let i = 0; i < CODE_LEN; i++) s += ALPHABET[randomInt(ALPHABET.length)];
  return s;
}

/** Normalise a code the way we present it to the user (uppercase, no ambiguous
 *  characters). Anything already stored on a user doc is canonical. */
export function normaliseCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, CODE_LEN);
}

/** Called on every first sign-in for a user. Creates the user doc + a unique
 *  referral code if not already there. `referredByCode`, if provided, is
 *  resolved to a uid and recorded ONCE (subsequent init calls ignore it — a
 *  user only ever has one referrer). Returns the current user doc.
 *
 *  This is idempotent: multiple concurrent inits for the same uid safely
 *  converge (the transaction re-reads inside the tx). */
export async function ensureUserDoc(
  uid: string,
  referredByCode: string | null,
  identity: { email: string | null; displayName: string | null } = { email: null, displayName: null },
  now: number = Date.now()
): Promise<UserDoc> {
  const db = adminDb();
  const userRef = db.collection("users").doc(uid);

  // Fast path: doc exists, no ref to apply, and identity is already filled in.
  const existing = await userRef.get();
  const cleanRef = referredByCode ? normaliseCode(referredByCode) : null;
  if (existing.exists) {
    const d = existing.data() as UserDoc;
    const needsIdentity =
      (!d.email && identity.email) || (!d.displayName && identity.displayName);
    if (!cleanRef && !needsIdentity && d.referralCount !== undefined) {
      return d;
    }
    if (!cleanRef && needsIdentity) {
      // Backfill identity without a transaction — nothing else to coordinate.
      const patch: Partial<UserDoc> = { updatedAt: now };
      if (!d.email && identity.email) patch.email = identity.email;
      if (!d.displayName && identity.displayName) patch.displayName = identity.displayName;
      await userRef.update(patch);
      return { ...d, ...patch } as UserDoc;
    }
    if (d.referredBy) return d;
  }

  // Create-or-attach path: transaction so the code claim + user doc + referrer
  // increment all happen together (no half-writes if something races).
  const referrerUid = cleanRef ? await resolveReferrer(cleanRef, uid) : null;

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(userRef);

    if (!snap.exists) {
      // First time this uid ever signs in. Claim a unique referral code.
      const code = await claimUniqueCode(tx, uid);
      const doc: UserDoc = {
        uid,
        referralCode: code,
        referredBy: referrerUid,
        referralCount: 0,
        referralMonthsGranted: 0,
        email: identity.email,
        displayName: identity.displayName,
        createdAt: now,
        updatedAt: now,
      };
      tx.set(userRef, doc);
      if (referrerUid) await creditReferrer(tx, referrerUid, now);
      return doc;
    }

    // Doc exists. Apply referrer (if new) and/or backfill identity.
    const d = snap.data() as UserDoc;
    const patch: Partial<UserDoc> = { updatedAt: now };
    let credited = false;
    if (!d.referredBy && referrerUid) {
      patch.referredBy = referrerUid;
      credited = true;
    }
    if (!d.email && identity.email) patch.email = identity.email;
    if (!d.displayName && identity.displayName) patch.displayName = identity.displayName;
    if (Object.keys(patch).length > 1) tx.update(userRef, patch);
    if (credited && referrerUid) await creditReferrer(tx, referrerUid, now);
    return { ...d, ...patch } as UserDoc;
  });
}

/** Load the user doc without side effects. Used by the account page. */
export async function getUserDoc(uid: string): Promise<UserDoc | null> {
  const snap = await adminDb().collection("users").doc(uid).get();
  return snap.exists ? (snap.data() as UserDoc) : null;
}

/** Resolve a referral code to the referrer's uid. Returns null when the code
 *  is unknown or when it points at the same user (a self-referral). */
async function resolveReferrer(code: string, selfUid: string): Promise<string | null> {
  const snap = await adminDb().collection("referralCodes").doc(code).get();
  if (!snap.exists) return null;
  const uid = snap.data()?.uid as string | undefined;
  if (!uid || uid === selfUid) return null;
  return uid;
}

/** Reserve a unique code for the new user. `code` collisions are astronomical
 *  at 6 chars but we retry a handful of times to be safe. */
async function claimUniqueCode(
  tx: FirebaseFirestore.Transaction,
  uid: string
): Promise<string> {
  const db = adminDb();
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = randomCode();
    const codeRef = db.collection("referralCodes").doc(code);
    const existing = await tx.get(codeRef);
    if (existing.exists) continue;
    tx.set(codeRef, { uid });
    return code;
  }
  throw new Error("Could not allocate a referral code — try again.");
}

/** Increment the referrer's count and, if they've now crossed a REWARD
 *  threshold, extend their Summit promo grant by REWARD_DAYS. */
async function creditReferrer(
  tx: FirebaseFirestore.Transaction,
  referrerUid: string,
  now: number
): Promise<void> {
  const db = adminDb();
  const referrerRef = db.collection("users").doc(referrerUid);
  const entRef = db.collection("entitlements").doc(referrerUid);
  const snap = await tx.get(referrerRef);

  // If the referrer's own user doc doesn't exist yet (edge case: they got
  // referred before they ever hit /api/user/init), skip crediting — the count
  // would be lost when their doc is created. Referral would still be
  // recorded on the referred user; the referrer just won't see it until the
  // NEXT referral, when their user doc will exist.
  if (!snap.exists) return;

  const d = snap.data() as UserDoc;
  const nextCount = d.referralCount + 1;
  const rewardsEarned = Math.floor(nextCount / REFERRALS_PER_REWARD);
  const rewardsToGrant = rewardsEarned - d.referralMonthsGranted;

  tx.update(referrerRef, {
    referralCount: nextCount,
    referralMonthsGranted: rewardsEarned,
    updatedAt: now,
  });

  if (rewardsToGrant > 0) {
    // Extend (don't clobber) the existing promo grant. If the current grant
    // has already lapsed or is absent, base the new expiry on now.
    const entSnap = await tx.get(entRef);
    const cur = entSnap.data() || {};
    const currentExpiry: number | null =
      typeof cur.promoExpiresAt === "number" && cur.promoExpiresAt > now
        ? cur.promoExpiresAt
        : now;
    const nextExpiry = currentExpiry + rewardsToGrant * REWARD_DAYS * 86_400_000;
    tx.set(
      entRef,
      {
        promoTier: REWARD_TIER,
        promoExpiresAt: nextExpiry,
        promoSource: "referral",
        promoUpdatedAt: now,
      },
      { merge: true }
    );
  }
}

/** How many more referrals until the next free month. Used in the account page. */
export function referralsToNextReward(count: number): number {
  const nextMilestone = Math.floor(count / REFERRALS_PER_REWARD + 1) * REFERRALS_PER_REWARD;
  return nextMilestone - count;
}

export const REFERRAL_CONFIG = {
  perReward: REFERRALS_PER_REWARD,
  rewardDays: REWARD_DAYS,
  rewardTier: REWARD_TIER,
  codeLength: CODE_LEN,
} as const;

/** Latest users who joined with this referrer's code. Capped so a very
 *  successful ambassador doesn't blow the response size. */
export async function listReferrals(referrerUid: string, limit = 20): Promise<ReferredJoin[]> {
  const snap = await adminDb()
    .collection("users")
    .where("referredBy", "==", referrerUid)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();
  return snap.docs.map((d) => {
    const u = d.data() as UserDoc;
    return {
      uid: u.uid,
      displayName: u.displayName ?? null,
      email: u.email ?? null,
      joinedAt: u.createdAt,
    };
  });
}
