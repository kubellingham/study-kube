// Who counts as the Kube owner. Two owner-only powers, deliberately separate
// from the paid access model (see lib/entitlement.ts):
//   1. Visibility of the built-in courses (CSE22D/46D/MECO3D) — lib/course.
//   2. The /admin back office (mint promo codes).
// The owner's *climbing* access is NOT here — that flows through a promo code
// like any user, so an expired code locks the owner exactly the same.
export const OWNER_EMAILS = ["ikube77@gmail.com"];

export function isOwner(email: string | null | undefined): boolean {
  return !!email && OWNER_EMAILS.includes(email.toLowerCase());
}
