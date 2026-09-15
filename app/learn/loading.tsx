// Shown by Next during segment transitions inside /learn — the moment
// the router is fetching the next page's data. A tiny skeleton beats
// the plain-white flash the app used to show.
export default function LearnLoading() {
  return (
    <div
      aria-busy
      style={{
        minHeight: "60dvh",
        display: "grid",
        placeItems: "center",
        padding: "48px 24px",
        color: "#8593a3",
        fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 12,
            background:
              "linear-gradient(135deg, #1f6f6b 0%, #2b8480 60%, #175a56 100%)",
            boxShadow: "0 8px 22px -8px rgba(20,32,43,.28)",
            animation: "k-loading-breathe 1.6s ease-in-out infinite",
          }}
        />
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          Kube is fetching…
        </div>
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
@keyframes k-loading-breathe {
  0%, 100% { transform: scale(1); opacity: .85; }
  50% { transform: scale(1.08); opacity: 1; }
}
`,
        }}
      />
    </div>
  );
}
