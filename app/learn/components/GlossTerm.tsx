"use client";

// A word in Kube's "vocabulary" — jargon a beginner might not know (VCC, GND,
// propagation delay). Rendered with a dotted underline; hover on desktop or tap
// on touch pops a small card with a one-line plain definition. Kube marks these
// inline as [[term|definition]] and Rich turns each into one of these.
import { useEffect, useRef, useState } from "react";

export default function GlossTerm({ term, def }: { term: string; def: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  // Tap-outside / Escape closes the popover (matters on touch, where there's
  // no hover-out).
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span
      ref={ref}
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); setOpen((v) => !v); }}
        className="font-semibold"
        style={{
          color: "var(--ink)",
          textDecoration: "underline dotted",
          textUnderlineOffset: "3px",
          textDecorationThickness: "1.5px",
          textDecorationColor: "var(--kube)",
          cursor: "help",
          background: "none",
          border: "none",
          padding: 0,
          font: "inherit",
        }}
        aria-expanded={open}
      >
        {term}
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute left-1/2 z-50 mt-1 block w-max max-w-[240px] -translate-x-1/2 rounded-xl px-3 py-2 text-left text-xs font-normal leading-snug shadow-lg"
          style={{
            top: "100%",
            background: "var(--ink)",
            color: "var(--card)",
            boxShadow: "0 8px 24px rgba(20,32,43,.28)",
          }}
        >
          <span className="mb-0.5 block font-semibold" style={{ color: "var(--card)" }}>{term}</span>
          {def}
        </span>
      )}
    </span>
  );
}
