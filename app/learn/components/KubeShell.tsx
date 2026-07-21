"use client";

// The .kube wrapper with the redesign's switchable moods and ladder
// orientation. Choices persist per device (localStorage) and apply across
// every learn page via the [data-mood] token overrides in learn.css.
import { createContext, useContext, useEffect, useState } from "react";

export type KubeMood = "studious" | "bookshelf" | "midnight" | "meadow";
export type LadderLayout = "vertical" | "horizontal";

export const MOODS: { id: KubeMood; label: string; dot: string; ring: string }[] = [
  { id: "studious", label: "Studious", dot: "#eef1f4", ring: "#1f6f6b" },
  { id: "bookshelf", label: "Bookshelf", dot: "#f4efe6", ring: "#c07a1c" },
  { id: "midnight", label: "Midnight", dot: "#1a1612", ring: "#5cbdb6" },
  { id: "meadow", label: "Meadow", dot: "#e8efe4", ring: "#3d7a4a" },
];

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
  const [mood, setMoodState] = useState<KubeMood>("studious");
  const [layout, setLayoutState] = useState<LadderLayout>("vertical");

  useEffect(() => {
    try {
      const m = localStorage.getItem("kube-mood") as KubeMood | null;
      if (m && MOODS.some((x) => x.id === m)) setMoodState(m);
      const l = localStorage.getItem("kube-layout") as LadderLayout | null;
      if (l === "horizontal" || l === "vertical") setLayoutState(l);
    } catch {
      // Private browsing — defaults are fine.
    }
  }, []);

  const setMood = (m: KubeMood) => {
    setMoodState(m);
    try {
      localStorage.setItem("kube-mood", m);
    } catch {}
  };
  const setLayout = (l: LadderLayout) => {
    setLayoutState(l);
    try {
      localStorage.setItem("kube-layout", l);
    } catch {}
  };

  return (
    <ThemeContext.Provider value={{ mood, setMood, layout, setLayout }}>
      <div
        className="kube flex-1"
        data-mood={mood === "studious" ? undefined : mood}
        style={{ transition: "background 0.4s ease" }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
