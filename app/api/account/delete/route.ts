import { NextRequest } from "next/server";
import { getAuth } from "@/lib/api-helpers";
import { adminDb } from "@/lib/firebase/admin";
import { emailKey, USER_DATA_COLLECTIONS } from "@/lib/account";

export const runtime = "nodejs";

// Delete the signed-in user's account data and record the "don't fully forget
// you" ledger entry. The Firebase Auth user itself is deleted client-side
// (firebase-admin/auth isn't importable on this runtime); the email ledger is
// what actually blocks a returning account from reclaiming the intro price.
export async function POST(req: NextRequest) {
  const auth = await getAuth(req);
  if (!auth) return Response.json({ error: "Not signed in." }, { status: 401 });
  const db = adminDb();
  const uid = auth.uid;

  try {
    // Note whether this account ever paid, then record the email key so its
    // first-month intro is not offered again on return.
    const entRef = db.collection("entitlements").doc(uid);
    const ent = (await entRef.get()).data() || {};
    const hadPaid = !!(ent.stripeTier || ent.promoTier || ent.crewTier || ent.stripeCustomerId);
    const key = emailKey(auth.email);
    if (key) {
      await db.collection("formerAccounts").doc(key).set(
        { deletedAt: Date.now(), hadPaid, uid },
        { merge: true }
      );
    }

    // Gather every doc owned by this user across all data collections.
    const refs: FirebaseFirestore.DocumentReference[] = [entRef];
    for (const name of USER_DATA_COLLECTIONS) {
      const snap = await db.collection(name).where("userId", "==", uid).get();
      snap.forEach((d) => refs.push(d.ref));
    }

    // Delete in batches (Firestore caps a batch at 500 writes).
    for (let i = 0; i < refs.length; i += 400) {
      const batch = db.batch();
      refs.slice(i, i + 400).forEach((ref) => batch.delete(ref));
      await batch.commit();
    }

    return Response.json({ ok: true, deleted: refs.length });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Could not delete the account." },
      { status: 500 }
    );
  }
}
