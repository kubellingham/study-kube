"use client";

// Full-screen Kube-branded loading state, for the redirect/auth-gate moments
// that live outside the /learn token scope (root, legacy dashboard).
export default function BrandLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      className="flex-1"
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        background: "#eef1f4",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontFamily: "'Fraunces',Georgia,serif",
            fontWeight: 600,
            fontSize: 26,
            letterSpacing: "-.02em",
          }}
        >
          <span style={{ color: "#16202b" }}>Studying</span>
          <span style={{ color: "#1f6f6b" }}>Kube</span>
        </div>
        <div
          style={{
            margin: "16px auto 0",
            width: 20,
            height: 20,
            borderRadius: "50%",
            border: "2px solid #b4d8d5",
            borderTopColor: "#1f6f6b",
            animation: "kube-spin .8s linear infinite",
          }}
        />
        <div
          style={{
            marginTop: 14,
            fontFamily: "'JetBrains Mono',ui-monospace,monospace",
            fontSize: 11,
            letterSpacing: ".08em",
            color: "#8593a3",
          }}
        >
          {label}
        </div>
      </div>
      <style>{`@keyframes kube-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
