// Kube Crew — group access. The leader pays a Crew subscription; members join
// with an invite code and get Summit-grade access ("crew" tier) for as long as
// the leader's subscription stays active and there's a free seat. Personal
// progress stays personal per member. (Shared material library is a follow-up.)
import { adminDb } from "@/lib/firebase/admin";
import type { CrewSize } from "@/lib/stripe";

export interface Crew {
  leaderUid: string;
  leaderEmail: string | null;
  size: CrewSize;
  inviteCode: string;
  memberUids: string[]; // includes the leader
  active: boolean;
  createdAt: number;
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function makeInvite(): string {
  const { randomInt } = require("crypto") as typeof import("crypto");
  let s = "";
  for (let i = 0; i < 8; i++) s += ALPHABET[randomInt(ALPHABET.length)];
  return s;
}

function crewRef(leaderUid: string) {
  return adminDb().collection("crews").doc(leaderUid);
}

/** Give a member (or clear) the crew grant on their entitlement doc. */
async function setMemberGrant(uid: string, leaderUid: string | null) {
  await adminDb().collection("entitlements").doc(uid).set(
    leaderUid
      ? { crewTier: "crew", crewExpiresAt: null, crewLeaderUid: leaderUid }
      : { crewTier: null, crewExpiresAt: null, crewLeaderUid: null },
    { merge: true }
  );
}

/** Called from the Stripe webhook when a leader's Crew subscription changes. */
export async function provisionCrew(
  leaderUid: string,
  leaderEmail: string | null,
  size: CrewSize,
  active: boolean
): Promise<void> {
  const ref = crewRef(leaderUid);
  const snap = await ref.get();

  if (active) {
    if (!snap.exists) {
      const crew: Crew = {
        leaderUid, leaderEmail, size, inviteCode: makeInvite(),
        memberUids: [leaderUid], active: true, createdAt: Date.now(),
      };
      await ref.set(crew);
    } else {
      await ref.set({ size, active: true, leaderEmail }, { merge: true });
    }
    return;
  }

  // Subscription ended: revoke members' crew grant, keep the leader row inert.
  if (snap.exists) {
    const c = snap.data() as Crew;
    await Promise.all(
      (c.memberUids || []).filter((m) => m !== leaderUid).map((m) => setMemberGrant(m, null))
    );
    await ref.set({ active: false, memberUids: [leaderUid] }, { merge: true });
  }
}

export type JoinResult = { ok: true; leaderEmail: string | null } | { ok: false; reason: string };

export async function joinCrew(code: string, uid: string): Promise<JoinResult> {
  const clean = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (clean.length !== 8) return { ok: false, reason: "That invite code doesn't look right." };

  const q = await adminDb().collection("crews").where("inviteCode", "==", clean).limit(1).get();
  if (q.empty) return { ok: false, reason: "No crew found for that code." };
  const ref = q.docs[0].ref;

  try {
    const email = await adminDb().runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const c = snap.data() as Crew;
      if (!c.active) throw new Error("That crew isn't active.");
      if (c.leaderUid === uid) throw new Error("You're the leader of this crew.");
      const members = c.memberUids || [];
      if (members.includes(uid)) return c.leaderEmail; // already in — idempotent
      if (members.length >= c.size) throw new Error("That crew is full.");
      tx.update(ref, { memberUids: [...members, uid] });
      return c.leaderEmail;
    });
    await setMemberGrant(uid, q.docs[0].id);
    return { ok: true, leaderEmail: email };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : "Could not join that crew." };
  }
}

export async function leaveCrew(uid: string): Promise<void> {
  const crew = await getCrewForMember(uid);
  if (crew && crew.leaderUid !== uid) {
    await crewRef(crew.leaderUid).set(
      { memberUids: crew.memberUids.filter((m) => m !== uid) },
      { merge: true }
    );
  }
  await setMemberGrant(uid, null);
}

export async function getCrewForLeader(uid: string): Promise<Crew | null> {
  const snap = await crewRef(uid).get();
  return snap.exists ? (snap.data() as Crew) : null;
}

export async function getCrewForMember(uid: string): Promise<Crew | null> {
  const leaderUid = (await adminDb().collection("entitlements").doc(uid).get()).data()?.crewLeaderUid as string | undefined;
  if (!leaderUid) return null;
  const snap = await crewRef(leaderUid).get();
  return snap.exists ? (snap.data() as Crew) : null;
}
