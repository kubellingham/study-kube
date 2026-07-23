"use client";

// The .kube wrapper. The app has committed to the fixed "Studious" (teal)
// palette used by the dashboard, so the old per-device mood + ladder-
// orientation switch is retired: every /learn page now renders the base
// tokens (learn.css .kube), and nothing clashes page-to-page anymore.
//
// The theme context is kept as a no-op so any lingering import still resolves;
// mood is always "studious" and no [data-mood] is applied.
import { createContext, useContext } from "react";

export type KubeMood = "studious";
export type LadderLayout = "vertical" | "horizontal";

interface KubeTheme {
  mood: KubeMood;
  setMood: (m: KubeMood) => void;
  layout: LadderLayout;
  setLayout: (l: LadderLayout) => void;
}

const ThemeContext = createContext<KubeTheme>({
  mood: "studious",
  setMood: () => {},
  layout: "vertical",
  setLayout: () => {},
});

export function useKubeTheme(): KubeTheme {
  return useContext(ThemeContext);
}

export default function KubeShell({ children }: { children: React.ReactNode }) {
  return <div className="kube flex-1">{children}</div>;
}
