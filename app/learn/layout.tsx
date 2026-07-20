import type { Metadata } from "next";
import "./learn.css";

export const metadata: Metadata = {
  title: "Kube — learn",
};

const FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap";

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="kube flex-1">
      {/* React hoists these into <head>. Runtime Google Fonts keeps the build
          offline-safe (no next/font network fetch at build time). */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link rel="stylesheet" href={FONTS_URL} />
      {children}
    </div>
  );
}
