"use client";

// Viewport helpers for the layouts that are built with inline styles (the
// learn shell, the practice hub) and so can't use CSS media queries directly.
// Renders desktop-first on the server, then corrects on mount.
import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatches(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return matches;
}

/** Phone-sized: the three-column shell collapses to one column + a tab bar. */
export const useIsMobile = () => useMediaQuery("(max-width: 860px)");
