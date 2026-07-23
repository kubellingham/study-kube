// Server-side WebAuthn helpers for the back office. A passkey step-up guards
// the mint action: once the owner registers one, minting requires a fresh
// passkey assertion (exchanged for a short-lived, single-use mint token).
import type { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export const RP_NAME = "StudyingKube";

/** rpID (the registrable domain) + full origin, derived from the request so it
 *  works on the vercel.app host without hardcoding. */
export function rpFromReq(req: NextRequest): { rpID: string; origin: string } {
  const host = (req.headers.get("host") || "localhost").trim();
  const proto = req.headers.get("x-forwarded-proto") || "https";
  return { rpID: host.split(":")[0] || "localhost", origin: `${proto}://${host}` };
}

export const b64uFromBytes = (u: Uint8Array) => Buffer.from(u).toString("base64url");
export const bytesFromB64u = (s: string) => new Uint8Array(Buffer.from(s, "base64url"));

// ── One-ceremony challenge (per owner uid) ────────────────────────────────
export async function saveChallenge(uid: string, challenge: string): Promise<void> {
  await adminDb().collection("webauthnChallenges").doc(uid).set({ challenge, expiresAt: Date.now() + 300_000 });
}
export async function takeChallenge(uid: string): Promise<string | null> {
  const ref = adminDb().collection("webauthnChallenges").doc(uid);
  const s = await ref.get();
  await ref.delete().catch(() => {});
  if (!s.exists) return null;
  const d = s.data() as { challenge: string; expiresAt: number };
  return d.expiresAt > Date.now() ? d.challenge : null;
}

// ── Stored passkeys ───────────────────────────────────────────────────────
export interface StoredPasskey {
  id: string; // credential id (base64url)
  uid: string;
  email: string | null;
  publicKey: string; // base64url
  counter: number;
  transports?: string[];
  createdAt: number;
}
export async function listOwnerPasskeys(uid: string): Promise<StoredPasskey[]> {
  const snap = await adminDb().collection("passkeys").where("uid", "==", uid).get();
  return snap.docs.map((d) => d.data() as StoredPasskey);
}
export async function savePasskey(p: StoredPasskey): Promise<void> {
  await adminDb().collection("passkeys").doc(p.id).set(p);
}
export async function updatePasskeyCounter(id: string, counter: number): Promise<void> {
  await adminDb().collection("passkeys").doc(id).update({ counter }).catch(() => {});
}

// ── Single-use mint token (proof of a fresh passkey step-up) ───────────────
export async function issueMintToken(uid: string): Promise<string> {
  const { randomBytes } = require("crypto") as typeof import("crypto");
  const token = randomBytes(24).toString("base64url");
  await adminDb().collection("mintTokens").doc(token).set({ uid, expiresAt: Date.now() + 120_000 });
  return token;
}
export async function consumeMintToken(uid: string, token: unknown): Promise<boolean> {
  if (typeof token !== "string" || !token) return false;
  const ref = adminDb().collection("mintTokens").doc(token);
  const s = await ref.get();
  await ref.delete().catch(() => {});
  if (!s.exists) return false;
  const d = s.data() as { uid: string; expiresAt: number };
  return d.uid === uid && d.expiresAt > Date.now();
}
