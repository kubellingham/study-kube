import type { Metadata } from "next";
import "@/app/learn/learn.css";
import KubeShell from "@/app/learn/components/KubeShell";

export const metadata: Metadata = {
  title: "Try Kube — a real lesson, no signup",
  description:
    "Climb a real Kube lesson in about a minute — no account needed. How to actually study: spacing, active recall, and spaced repetition.",
};

const FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap";

export default function TryLayout({ children }: { children: React.ReactNode }) {
  return (
    <KubeShell>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={FONTS_URL} />
      {children}
    </KubeShell>
  );
}
