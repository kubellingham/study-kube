"use client";

// Kube's "digesting" loader — shown while a file is uploading / being
// digested. Rewritten to use CSS keyframe animations (see learn.css
// §"Digesting animation") so the browser runs everything on the
// compositor. The old RAF+setState engine stuttered under a heavy
// upload on low-end laptops; this version paints smoothly on the same
// machines because React never sees the frame updates. Indeterminate
// on purpose: the wait is long, so nothing ever "completes".
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";

/** External-store subscription for OS reduced-motion — keeps the effect
 *  free of the setState-in-effect cascade. */
function subscribeReduce(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia(REDUCE_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
function readReduce(): boolean {
  return typeof window !== "undefined" && window.matchMedia(REDUCE_QUERY).matches;
}
function readReduceServer(): boolean {
  return false;
}

const K = {
  ink: "#16202b",
  faint: "#8593a3",
  bg: "#eef1f4",
  card: "#ffffff",
  line: "#dce2e8",
  kubeSoft: "#e2f0ef",
  display: "'Fraunces',Georgia,serif",
  body: "'Inter',system-ui,sans-serif",
  mono: "'JetBrains Mono',monospace",
};

const SRC = {
  pdf: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M13 3v5h5"/></svg>',
  yt: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="2" y="5" width="20" height="14" rx="4" fill="currentColor"/><path d="M10 9l5 3-5 3z" fill="#fff"/></svg>',
  txt: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 6h14M5 11h14M5 16h9"/></svg>',
  web: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" stroke-linecap="round"/></svg>',
};

/** Source cards ferried from each corner into the cube. Delays stagger
 *  their 3.2s cycles evenly (0, 0.8s, 1.6s, 2.4s). */
const SOURCES = [
  { ic: SRC.pdf, label: "lecture.pdf", sx: 250, sy: 150, rot: -7, delay: 0 },
  { ic: SRC.yt, label: "Khan clip", sx: 1030, sy: 176, rot: 6, delay: 0.8 },
  { ic: SRC.txt, label: "my notes", sx: 236, sy: 452, rot: 5, delay: 1.6 },
  { ic: SRC.web, label: "article", sx: 1044, sy: 470, rot: -6, delay: 2.4 },
];

const TIPS = [
  "Grab a coffee — Kube's reading every page.",
  "Untangling each idea from the ones it leans on…",
  "Turning dense PDFs into bite-size wins.",
  "Big unit, big payoff — laying out your ladder.",
  "Good notes today, gold marks in the exam.",
];

const CUBE_CX = 640;
const CUBE_CY = 296;
const CUBE_SIZE = 150;

/** A 3D cube built with six flat faces. The gentle spin lives on the outer
 *  rotator, the initial pop-in + breathe on the inner scaler — nested so
 *  both animations compose without a transform conflict. */
function Cube({ accent }: { accent: string }) {
  const t = CUBE_SIZE / 2;
  const face = (tf: string, shade: string, i: number) => (
    <div
      key={i}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: CUBE_SIZE,
        height: CUBE_SIZE,
        borderRadius: 16,
        background: accent,
        transform: tf,
        backfaceVisibility: "hidden",
        boxShadow: "inset 0 0 0 2px rgba(255,255,255,.10)",
      }}
    >
      <div style={{ position: "absolute", inset: 0, borderRadius: 16, background: shade }} />
    </div>
  );
  return (
    <div className="k-dig-cube-breathe" style={{ width: CUBE_SIZE, height: CUBE_SIZE, perspective: 900 }}>
      <div
        className="k-dig-cube-rot"
        style={{
          position: "relative",
          width: CUBE_SIZE,
          height: CUBE_SIZE,
          transformStyle: "preserve-3d",
          filter: "drop-shadow(0 8px 22px rgba(20,32,43,.28))",
        }}
      >
        {face(`translateZ(${t}px)`, "rgba(255,255,255,0)", 0)}
        {face(`rotateY(180deg) translateZ(${t}px)`, "rgba(0,0,0,.30)", 1)}
        {face(`rotateY(90deg) translateZ(${t}px)`, "rgba(0,0,0,.22)", 2)}
        {face(`rotateY(-90deg) translateZ(${t}px)`, "rgba(0,0,0,.13)", 3)}
        {face(`rotateX(90deg) translateZ(${t}px)`, "rgba(255,255,255,.20)", 4)}
        {face(`rotateX(-90deg) translateZ(${t}px)`, "rgba(0,0,0,.34)", 5)}
      </div>
    </div>
  );
}

/** The 1280×720 loading stage. All motion is CSS keyframes in learn.css. */
function LoadingStage({ accent }: { accent: string }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: K.bg, overflow: "hidden", fontFamily: K.body }}>
      {/* Sonar pings — two expanding rings; the second is delayed a
       *  half-period so they alternate. */}
      <div
        style={{
          position: "absolute",
          left: CUBE_CX,
          top: CUBE_CY,
          width: 320,
          height: 320,
          marginLeft: -160,
          marginTop: -160,
          zIndex: 1,
          pointerEvents: "none",
        }}
      >
        <div
          className="k-dig-ping"
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: `2px solid ${accent}`,
            transformOrigin: "center",
          }}
        />
        <div
          className="k-dig-ping k-dig-ping-b"
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: `2px solid ${accent}`,
            transformOrigin: "center",
          }}
        />
      </div>

      {/* Orbit dots — elliptical (104 × 64) around the cube centre. */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: CUBE_CX,
            top: CUBE_CY,
            width: 9,
            height: 9,
            marginLeft: -4.5,
            marginTop: -8.5,
            zIndex: 2,
            pointerEvents: "none",
          }}
        >
          <div
            className="k-dig-orbit"
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: accent,
              opacity: 0.55,
              animationDelay: `${-i * (5.71 / 3)}s`,
            }}
          />
        </div>
      ))}

      {/* The cube itself, centred. */}
      <div
        style={{
          position: "absolute",
          left: CUBE_CX,
          top: CUBE_CY,
          marginLeft: -CUBE_SIZE / 2,
          marginTop: -CUBE_SIZE / 2,
          zIndex: 3,
        }}
      >
        <Cube accent={accent} />
      </div>

      {/* Source cards — each ferried from its corner into the cube on a
       *  3.2s cycle, staggered 0.8s apart. */}
      {SOURCES.map((s, i) => (
        <div
          key={i}
          className="k-dig-card"
          style={{
            zIndex: 5,
            display: "flex",
            alignItems: "center",
            gap: 9,
            background: K.card,
            border: `1px solid ${K.line}`,
            borderRadius: 12,
            padding: "9px 13px",
            boxShadow: "0 12px 26px -12px rgba(15,32,50,.45)",
            whiteSpace: "nowrap",
            ["--sx" as string]: `${s.sx}px`,
            ["--sy" as string]: `${s.sy}px`,
            ["--cx" as string]: `${CUBE_CX}px`,
            ["--cy" as string]: `${CUBE_CY}px`,
            ["--rot" as string]: `${s.rot}deg`,
            ["--k-delay" as string]: `${s.delay}s`,
          } as React.CSSProperties}
        >
          <span
            style={{ display: "grid", placeItems: "center", width: 22, height: 22, color: accent }}
            dangerouslySetInnerHTML={{ __html: s.ic }}
          />
          <span style={{ fontFamily: K.mono, fontSize: 12, fontWeight: 600, color: K.ink }}>
            {s.label}
          </span>
        </div>
      ))}

      {/* Loading dots — three pulses staggered so the "wave" reads. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 470,
          display: "flex",
          justifyContent: "center",
          gap: 9,
          zIndex: 6,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="k-dig-dot"
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: accent,
              animationDelay: `${-i * 0.18}s`,
            }}
          />
        ))}
      </div>

      {/* Tips rotator — 5 tips × 3s each, 15s cycle. Each tip fades in and
       *  out inside its own 3s slot; staggered so at any moment exactly one
       *  is visible. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 500,
          textAlign: "center",
          zIndex: 6,
          padding: "0 80px",
        }}
      >
        {TIPS.map((tip, i) => (
          <div
            key={i}
            className="k-dig-tip"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              padding: "0 80px",
              fontFamily: K.display,
              fontWeight: 500,
              fontSize: 23,
              letterSpacing: "-0.01em",
              color: K.ink,
              animationDelay: `${i * 3}s`,
            }}
          >
            {tip}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Reduced-motion version: a still cube + a plain "reading your file…"
 *  label. Same visual family as the animated version but no motion. */
function StillStage({ accent }: { accent: string }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: K.bg,
        display: "grid",
        placeItems: "center",
        fontFamily: K.body,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "inline-block" }}>
          <Cube accent={accent} />
        </div>
        <div
          style={{
            marginTop: 32,
            fontFamily: K.display,
            fontWeight: 500,
            fontSize: 20,
            color: K.ink,
          }}
        >
          Kube is reading your file…
        </div>
      </div>
    </div>
  );
}

/** Scales the fixed 1280×720 stage to fit its container (contain). */
export default function DigestingAnimation({
  accent = "#1f6f6b",
  className,
  style,
}: {
  accent?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const reduce = useSyncExternalStore(subscribeReduce, readReduce, readReduceServer);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const fit = () => {
      const r = el.getBoundingClientRect();
      setScale(Math.min(r.width / 1280, r.height / 720));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        display: "grid",
        placeItems: "center",
        background: K.bg,
        ...style,
      }}
    >
      <div
        style={{
          width: 1280,
          height: 720,
          position: "relative",
          transform: `scale(${scale})`,
          flex: "none",
          borderRadius: 24,
          overflow: "hidden",
        }}
      >
        {reduce ? <StillStage accent={accent} /> : <LoadingStage accent={accent} />}
      </div>
    </div>
  );
}
