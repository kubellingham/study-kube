"use client";

// Catches uncaught render errors anywhere below the root layout. Next
// re-mounts the tree when `reset()` runs, so a transient bug (a flaky
// network call, a bad Firestore snapshot) can be recovered from without
// a hard reload. Kube-voiced, not "an unexpected error occurred".
import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface it in the browser console for developers; Vercel captures the
    // server-side digest automatically.
    console.error("[kube] render error:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: "48px 24px",
        background: "#eef1f4",
        color: "#16202b",
        fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 560, textAlign: "center" }}>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "#8593a3",
            marginBottom: 18,
          }}
        >
          Kube stumbled
        </div>
        <h1
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontWeight: 600,
            fontSize: 40,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          Something snagged on the way up.
        </h1>
        <p
          style={{
            marginTop: 18,
            fontSize: 16,
            lineHeight: 1.6,
            color: "#46566a",
          }}
        >
          That&apos;s on us, not you — try again in a moment. If it keeps
          happening, drop a note to <a href="mailto:ikube77@gmail.com" style={{ color: "#1f6f6b", fontWeight: 600 }}>ikube77@gmail.com</a> and
          we&apos;ll look into it.
        </p>

        {error?.digest ? (
          <p
            style={{
              marginTop: 12,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: "#8593a3",
            }}
          >
            ref: {error.digest}
          </p>
        ) : null}

        <div
          style={{
            marginTop: 28,
            display: "flex",
            justifyContent: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={() => reset()}
            style={{
              border: "none",
              cursor: "pointer",
              background: "#1f6f6b",
              color: "#fff",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              padding: "12px 22px",
              borderRadius: 999,
            }}
          >
            Try again
          </button>
          <Link
            href="/learn"
            style={{
              display: "inline-block",
              background: "#fff",
              color: "#16202b",
              fontWeight: 600,
              fontSize: 14,
              padding: "12px 22px",
              borderRadius: 999,
              border: "1px solid #dce2e8",
              textDecoration: "none",
            }}
          >
            Back to your climb
          </Link>
        </div>
      </div>
    </div>
  );
}
