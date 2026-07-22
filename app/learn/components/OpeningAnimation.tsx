"use client";

// Kube's opening title — ported from StudyingKube Video.dc.html (Opening
// scene), compressed for use as a loading screen. "Kube" appears, "Studying"
// slides out from behind it, they part, a tagline settles, then the wordmark
// parks up to the sidebar logo slot as the whole overlay fades to reveal the
// app. Plays on app entry and when leaving a lesson by the back path.
import { useEffect, useRef, useState } from "react";
import { ip, easeOutBack, easeOutCubic, easeInOutCubic } from "./motion";

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

const END = 3.35; // seconds — total before onDone

function Stage({ lt, accent }: { lt: number; accent: string }) {
  // (1) Kube appears  (2) Studying emerges from behind  (3) they part
  const kOp = ip(lt, [0.15, 0.8], [0, 1]);
  const kSc = ip(lt, [0.15, 0.95], [0.7, 1], easeOutBack);
  const xS = ip(lt, [1.0, 1.9], [118, 0], easeInOutCubic);
  const xK = ip(lt, [1.0, 1.9], [118, 250], easeInOutCubic);
  const clipW = xK; // Studying is only revealed to the LEFT of Kube's edge

  // (4) park the wordmark to the top-left sidebar-logo slot
  const gL = ip(lt, [2.25, 3.15], [450, 30], easeInOutCubic);
  const gT = ip(lt, [2.25, 3.15], [312, 26], easeInOutCubic);
  const gS = ip(lt, [2.25, 3.15], [1, 0.38], easeInOutCubic);

  const decay = ip(lt, [2.25, 2.8], [1, 0]);
  const ulW = ip(lt, [1.9, 2.35], [0, 150], easeOutCubic) * decay;
  const tagOp = ip(lt, [1.35, 1.95], [0, 1]) * decay;
  const tagY = ip(lt, [1.35, 1.95], [12, 0], easeOutCubic);
  const drift = Math.sin(lt * 0.7);

  return (
    <div style={{ position: "absolute", inset: 0, background: K.bg, overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 620, height: 620, borderRadius: "50%", border: `1px solid ${K.kubeLine}`, opacity: 0.5 * decay, left: 820 + drift * 14, top: -160 - drift * 10 }} />
      <div style={{ position: "absolute", width: 420, height: 420, borderRadius: "50%", background: K.kubeSoft, opacity: 0.6 * decay, left: -140 - drift * 12, top: 380 + drift * 8 }} />

      <div style={{ position: "absolute", left: 0, right: 0, top: 404, display: "flex", flexDirection: "column", alignItems: "center", zIndex: 3, pointerEvents: "none" }}>
        <div style={{ height: 4, width: `${ulW}px`, borderRadius: 999, background: accent, opacity: 0.9 * decay }} />
        <div style={{ marginTop: 22, fontFamily: K.mono, fontSize: 14, fontWeight: 500, letterSpacing: "0.24em", textTransform: "uppercase", color: K.faint, opacity: tagOp, transform: `translateY(${tagY}px)` }}>
          Climb your course, one concept at a time
        </div>
      </div>

      <div style={{ position: "absolute", left: 0, top: 0, width: 384, height: 74, transformOrigin: "left top", transform: `translate(${gL}px, ${gT}px) scale(${gS})`, zIndex: 5, fontFamily: K.display, fontWeight: 600, fontSize: 62, letterSpacing: "-0.02em", lineHeight: "72px", whiteSpace: "nowrap" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: `${clipW}px`, height: 74, overflow: "hidden" }}>
          <span style={{ position: "absolute", top: 0, left: xS, color: K.ink }}>Studying</span>
        </div>
        <span style={{ position: "absolute", top: 0, left: xK, color: accent, opacity: kOp, transform: `scale(${kSc})`, transformOrigin: "left center", zIndex: 2 }}>Kube</span>
      </div>
    </div>
  );
}

export default function OpeningAnimation({ onDone, accent = "#1f6f6b" }: { onDone: () => void; accent?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [lt, setLt] = useState(0);
  const raf = useRef<number>(0);
  const start = useRef<number>(0);
  const done = useRef(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const fit = () => {
      const r = el.getBoundingClientRect();
      // cover: fill the screen; the bg matches so any overscan is invisible.
      setScale(Math.max(r.width / 1280, r.height / 720));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const t = setTimeout(() => onDone(), 350);
      return () => clearTimeout(t);
    }
    start.current = performance.now();
    const tick = (now: number) => {
      const t = (now - start.current) / 1000;
      setLt(t);
      if (t >= END) {
        if (!done.current) {
          done.current = true;
          onDone();
        }
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const overlayOp = ip(lt, [2.75, 3.3], [1, 0]);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      style={{ position: "fixed", inset: 0, zIndex: 200, background: K.bg, overflow: "hidden", display: "grid", placeItems: "center", opacity: overlayOp, pointerEvents: lt > 2.9 ? "none" : "auto" }}
    >
      <div style={{ width: 1280, height: 720, position: "relative", transform: `scale(${scale})`, flex: "none" }}>
        <Stage lt={lt} accent={accent} />
      </div>
    </div>
  );
}
