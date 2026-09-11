"use client";

// Kube's opening title — Studying/Kube wordmark choreography that plays on
// app entry and when leaving a lesson by the back path. Uses CSS keyframe
// animations (see learn.css §"Opening animation") so the browser runs
// everything on the compositor.
//
// Total: 3.35s (fires onDone at the end). Deliberately ignores the OS
// `prefers-reduced-motion` setting — this animation is Kube's front-door
// wow moment, not a decorative micro-interaction, and users who have
// Reduce Motion on at the OS level for other reasons still deserve to
// see the app's identity. Micro-interactions elsewhere in learn.css
// still respect the setting for real accessibility use.
import { useEffect, useRef, useState } from "react";

const K = {
  ink: "#16202b",
  faint: "#8593a3",
  bg: "#eef1f4",
  kube: "#1f6f6b",
  kubeSoft: "#e2f0ef",
  kubeLine: "#b4d8d5",
  display: "'Fraunces',Georgia,serif",
  mono: "'JetBrains Mono',monospace",
};

const END_MS = 3350;

/** The 1280×720 stage — every child position/size matches the original so
 *  the CSS keyframes in learn.css land on identical frames. */
function Stage({ accent }: { accent: string }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: K.bg, overflow: "hidden" }}>
      {/* Decorative circles (fade with tagline). */}
      <div
        className="k-open-circle"
        style={{
          position: "absolute",
          width: 620,
          height: 620,
          borderRadius: "50%",
          border: `1px solid ${K.kubeLine}`,
          left: 820,
          top: -160,
          ["--k-circle-op" as string]: "0.5",
        } as React.CSSProperties}
      />
      <div
        className="k-open-circle"
        style={{
          position: "absolute",
          width: 420,
          height: 420,
          borderRadius: "50%",
          background: K.kubeSoft,
          left: -140,
          top: 380,
          ["--k-circle-op" as string]: "0.6",
        } as React.CSSProperties}
      />

      {/* Underline + tagline, centered below the wordmark park spot. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 404,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 3,
          pointerEvents: "none",
        }}
      >
        <div
          className="k-open-underline"
          style={{ height: 4, borderRadius: 999, background: accent }}
        />
        <div
          className="k-open-tagline"
          style={{
            marginTop: 22,
            fontFamily: K.mono,
            fontSize: 14,
            fontWeight: 500,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: K.faint,
          }}
        >
          Climb your course, one concept at a time
        </div>
      </div>

      {/* The wordmark group: parks to (30, 26) with scale 0.38 at the end. */}
      <div
        className="k-open-word"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 384,
          height: 74,
          zIndex: 5,
          fontFamily: K.display,
          fontWeight: 600,
          fontSize: 62,
          letterSpacing: "-0.02em",
          lineHeight: "72px",
          whiteSpace: "nowrap",
        }}
      >
        {/* Studying clipped to the left of Kube's edge — width grows as Kube slides right. */}
        <div
          className="k-open-word-clip"
          style={{ position: "absolute", left: 0, top: 0, height: 74, overflow: "hidden" }}
        >
          <span
            className="k-open-studying"
            style={{ position: "absolute", top: 0, left: 0, color: K.ink }}
          >
            Studying
          </span>
        </div>
        <span
          className="k-open-kube"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            color: accent,
            transformOrigin: "left center",
            zIndex: 2,
          }}
        >
          Kube
        </span>
      </div>
    </div>
  );
}

export default function OpeningAnimation({
  onDone,
  accent = "#1f6f6b",
}: {
  onDone: () => void;
  accent?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const done = useRef(false);

  // Fit the 1280×720 stage to cover the viewport. Recomputed only on
  // resize, not per frame — so this is essentially free.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const fit = () => {
      const r = el.getBoundingClientRect();
      setScale(Math.max(r.width / 1280, r.height / 720));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Fire onDone when the CSS animation would end. Just a timer — the
  // browser is painting the frames itself.
  useEffect(() => {
    const t = setTimeout(() => {
      if (!done.current) {
        done.current = true;
        onDone();
      }
    }, END_MS);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="k-open-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: K.bg,
        overflow: "hidden",
        display: "grid",
        placeItems: "center",
      }}
    >
      <div
        style={{
          width: 1280,
          height: 720,
          position: "relative",
          transform: `scale(${scale})`,
          flex: "none",
        }}
      >
        <Stage accent={accent} />
      </div>
    </div>
  );
}
