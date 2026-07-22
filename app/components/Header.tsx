"use client";

// Shared top bar for the legacy material pages (/dashboard, /materials).
// These render outside the /learn token scope, so the Kube palette is inlined.
import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useUser } from "@/lib/use-user";

const KUBE = "#1f6f6b";
const INK = "#16202b";
const FAINT = "#8593a3";
const LINE = "#dce2e8";
const DISPLAY = "'Fraunces',Georgia,serif";

export default function Header() {
  const { user } = useUser();

  async function handleSignOut() {
    await signOut(auth());
    window.location.assign("/login");
  }

  return (
    <header style={{ borderBottom: `1px solid ${LINE}`, background: "#ffffff" }}>
      <div
        className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3"
      >
        <Link
          href="/learn"
          style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 20, letterSpacing: "-.02em" }}
        >
          <span style={{ color: INK }}>Studying</span>
          <span style={{ color: KUBE }}>Kube</span>
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <Link
            href="/learn"
            style={{
              borderRadius: 999,
              background: KUBE,
              padding: "7px 15px",
              fontWeight: 600,
              color: "#fff",
              boxShadow: "0 3px 0 rgba(20,32,43,.16)",
            }}
          >
            Learn
          </Link>
          {user?.email && (
            <span className="hidden sm:inline" style={{ color: FAINT }}>
              {user.email}
            </span>
          )}
          <button
            onClick={handleSignOut}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              borderRadius: 999,
              border: `1px solid ${LINE}`,
              padding: "7px 14px",
              fontWeight: 600,
              color: "#46566a",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
