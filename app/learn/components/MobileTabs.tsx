"use client";

// Phone navigation for the learn shell. The desktop layout is three columns
// (nav rail · path · status rail); on a phone the rails would eat 600px of a
// 390px screen, so they collapse and this thumb-reachable tab bar takes over.
import Link from "next/link";

const T = {
  card: "#ffffff",
  line: "#dce2e8",
  faint: "#8593a3",
  kube: "#1f6f6b",
  kubeSoft: "#e2f0ef",
  mono: "'JetBrains Mono',ui-monospace,monospace",
};

const ICONS: Record<string, React.ReactNode> = {
  Learn: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9" />
    </svg>
  ),
  Practice: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8h12l-3-3M20 16H8l3 3" />
    </svg>
  ),
  Notes: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <path d="M4 4h7v16H5a1 1 0 0 1-1-1V4z" />
      <path d="M11 4h8a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-8V4z" />
      <path d="M7 9h1M14 9h3M14 13h3" strokeLinecap="round" />
    </svg>
  ),
  Subjects: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <rect x="3.5" y="4.5" width="7" height="7" rx="1.6" />
      <rect x="13.5" y="4.5" width="7" height="7" rx="1.6" />
      <rect x="3.5" y="14.5" width="7" height="5" rx="1.6" />
      <rect x="13.5" y="14.5" width="7" height="5" rx="1.6" />
    </svg>
  ),
};

/** Height the tab bar occupies, so pages can pad their content clear of it. */
export const MOBILE_TABS_H = 64;

export default function MobileTabs({
  courseId,
  active,
}: {
  courseId: string;
  active: "Learn" | "Practice" | "Notes" | "Subjects";
}) {
  const tabs: [string, string][] = [
    ["Learn", `/learn/${courseId}`],
    ["Practice", `/learn/${courseId}/practice`],
    ["Notes", `/learn/${courseId}/glossary`],
    ["Subjects", "/learn"],
  ];
  return (
    <nav
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 70,
        display: "flex",
        background: T.card,
        borderTop: `1px solid ${T.line}`,
        // Clear the iOS home indicator.
        paddingBottom: "env(safe-area-inset-bottom)",
        boxShadow: "0 -2px 14px rgba(15,32,50,.06)",
      }}
    >
      {tabs.map(([label, href]) => {
        const on = label === active;
        return (
          <Link
            key={label}
            href={href}
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              // A comfortable thumb target.
              height: MOBILE_TABS_H,
              color: on ? T.kube : T.faint,
              background: on ? T.kubeSoft : "transparent",
              textDecoration: "none",
            }}
          >
            {ICONS[label]}
            <span
              style={{
                fontFamily: T.mono,
                fontWeight: 600,
                fontSize: 9.5,
                letterSpacing: ".08em",
                textTransform: "uppercase",
              }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
