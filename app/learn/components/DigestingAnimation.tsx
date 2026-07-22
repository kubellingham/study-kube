"use client";

// Kube's "digesting" loader — ported from StudyingKube Video.dc.html (Loading
// scene). A teal cube spins and pulls in source cards (pdf, video, notes,
// article) with sonar pings, orbiting workers, and rotating tips. Shown while
// a file is uploading / being digested. Indeterminate on purpose: the wait is
// long, so nothing ever "completes".
import { useEffect, useRef, useState } from "react";
import { ip, mod, easeOutBack, easeOutCubic, easeInOutCubic, easeInCubic } from "./motion";

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

const SOURCES = [
  { ic: SRC.pdf, label: "lecture.pdf", sx: 250, sy: 150, rot: -7 },
  { ic: SRC.yt, label: "Khan clip", sx: 1030, sy: 176, rot: 6 },
  { ic: SRC.txt, label: "my notes", sx: 236, sy: 452, rot: 5 },
  { ic: SRC.web, label: "article", sx: 1044, sy: 470, rot: -6 },
];

const TIPS = [
  "Grab a coffee — Kube's reading every page.",
  "Untangling each idea from the ones it leans on…",
  "Turning dense PDFs into bite-size wins.",
  "Big unit, big payoff — laying out your ladder.",
  "Good notes today, gold marks in the exam.",
];

function Cube3D({ size, accent, spin, tilt, scale }: { size: number; accent: string; spin: number; tilt: number; scale: number }) {
  const t = size / 2;
  const face = (tf: string, shade: string, i: number) => (
    <div key={i} style={{ position: "absolute", left: 0, top: 0, width: size, height: size, borderRadius: 16, background: accent, transform: tf, backfaceVisibility: "hidden", boxShadow: "inset 0 0 0 2px rgba(255,255,255,.10)" }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 16, background: shade }} />
    </div>
  );
  return (
    <div style={{ width: size, height: size, perspective: 900, transform: `scale(${scale})` }}>
      <div style={{ position: "relative", width: size, height: size, transformStyle: "preserve-3d", transform: `rotateX(${tilt}deg) rotateY(${spin}deg)`, filter: "drop-shadow(0 8px 22px rgba(20,32,43,.28))" }}>
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

/** The 1280×720 loading stage, driven by `lt` (seconds). Faithful to the design. */
function LoadingStage({ lt, accent }: { lt: number; accent: string }) {
  const cubeCX = 640;
  const cubeCY = 296;
  const P = 3.2;
  const N = SOURCES.length;
  const travel = 1.25;

  let absorb = 0;
  SOURCES.forEach((s, i) => {
    const local = mod(lt - i * (P / N), P);
    absorb = Math.max(absorb, Math.exp(-Math.pow((local - travel) / 0.12, 2)));
  });
  const spin = 36 + 8 * Math.sin(lt * 1.6);
  const breathe = 1 + 0.035 * Math.sin(lt * 3.1);
  const cubeScale = ip(lt, [0, 0.55], [0.55, 1], easeOutBack) * breathe * (1 + 0.09 * absorb);

  const pings = [0, 1].map((k) => {
    const ph = mod(lt * 0.55 + k * 0.5, 1);
    return { r: 86 + ph * 74, op: (1 - ph) * 0.3 };
  });
  const orbits = [0, 1, 2].map((i) => {
    const ang = lt * 1.1 + i * 2.094;
    return { x: Math.cos(ang) * 104, y: Math.sin(ang) * 64 - 4, z: Math.sin(ang) };
  });

  const TD = 3.0;
  const ti = Math.floor(lt / TD) % TIPS.length;
  const sub = mod(lt, TD) / TD;
  const tipOp = Math.max(0, Math.min(1, Math.min(sub / 0.1, (1 - sub) / 0.12)));
  const tipY = (1 - Math.min(1, sub / 0.16)) * 8;
  const dot = (i: number) => 0.35 + 0.55 * (0.5 + 0.5 * Math.sin(lt * 5 - i * 0.9));

  return (
    <div style={{ position: "absolute", inset: 0, background: K.bg, overflow: "hidden", fontFamily: K.body }}>
      <svg width="360" height="360" viewBox="0 0 360 360" style={{ position: "absolute", left: cubeCX, top: cubeCY, transform: "translate(-50%,-50%)", zIndex: 1 }}>
        {pings.map((pg, k) => (
          <circle key={k} cx="180" cy="180" r={pg.r} fill="none" stroke={accent} strokeWidth="2" opacity={pg.op} />
        ))}
      </svg>

      {orbits.map((o, i) => (
        <div key={i} style={{ position: "absolute", left: cubeCX + o.x, top: cubeCY + o.y, transform: "translate(-50%,-50%)", width: 9, height: 9, borderRadius: "50%", background: accent, opacity: 0.3 + 0.4 * (o.z + 1) / 2, zIndex: o.z > 0 ? 4 : 1 }} />
      ))}

      <div style={{ position: "absolute", left: cubeCX, top: cubeCY, transform: "translate(-50%,-50%)", zIndex: 3 }}>
        <Cube3D size={150} accent={accent} spin={spin} tilt={-22} scale={cubeScale} />
      </div>

      {SOURCES.map((s, i) => {
        const local = mod(lt - i * (P / N), P);
        if (local > travel + 0.1) return null;
        const cx = ip(local, [0, travel], [s.sx, cubeCX], easeInOutCubic);
        const cy = ip(local, [0, travel], [s.sy, cubeCY], easeInOutCubic);
        const op = ip(local, [0, 0.28], [0, 1]) * ip(local, [travel - 0.18, travel], [1, 0]);
        const sc = ip(local, [0, 0.28], [0.6, 1], easeOutBack) * ip(local, [travel - 0.34, travel], [1, 0.18], easeInCubic);
        return (
          <div key={i} style={{ position: "absolute", left: 0, top: 0, transform: `translate(${cx}px, ${cy}px) translate(-50%,-50%) scale(${sc}) rotate(${s.rot}deg)`, opacity: op, zIndex: 5, display: "flex", alignItems: "center", gap: 9, background: K.card, border: `1px solid ${K.line}`, borderRadius: 12, padding: "9px 13px", boxShadow: "0 12px 26px -12px rgba(15,32,50,.45)", whiteSpace: "nowrap" }}>
            <span style={{ display: "grid", placeItems: "center", width: 22, height: 22, color: accent }} dangerouslySetInnerHTML={{ __html: s.ic }} />
            <span style={{ fontFamily: K.mono, fontSize: 12, fontWeight: 600, color: K.ink }}>{s.label}</span>
          </div>
        );
      })}

      <div style={{ position: "absolute", left: 0, right: 0, top: 470, display: "flex", justifyContent: "center", gap: 9, zIndex: 6 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: accent, opacity: dot(i) }} />
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 500, textAlign: "center", zIndex: 6, padding: "0 80px" }}>
        <div style={{ fontFamily: K.display, fontWeight: 500, fontSize: 23, letterSpacing: "-0.01em", color: K.ink, opacity: tipOp, transform: `translateY(${tipY}px)` }}>{TIPS[ti]}</div>
      </div>
    </div>
  );
}

/** Scales the fixed 1280×720 stage to fit its container (contain). */
export default function DigestingAnimation({ accent = "#1f6f6b", className, style }: { accent?: string; className?: string; style?: React.CSSProperties }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [lt, setLt] = useState(0);
  const raf = useRef<number>(0);
  const start = useRef<number>(0);

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

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    start.current = performance.now();
    const tick = (now: number) => {
      const t = (now - start.current) / 1000;
      setLt(reduce ? 1.0 : t);
      if (!reduce) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return (
    <div ref={wrapRef} className={className} style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", display: "grid", placeItems: "center", background: K.bg, ...style }}>
      <div style={{ width: 1280, height: 720, position: "relative", transform: `scale(${scale})`, flex: "none", borderRadius: 24, overflow: "hidden" }}>
        <LoadingStage lt={lt} accent={accent} />
      </div>
    </div>
  );
}
