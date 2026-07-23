"use client";

// The dashboard — rebuilt to the KubeLearn design (Duolingo Learn.dc.html):
// a desktop three-column app shell. Left sidebar (wordmark · Learn/Practice/
// Notes · profile), centre a winding per-section-coloured ladder with a sticky
// unit banner + climb bar and a node popover, right rail (Pro · climb ring +
// Continue · Mock exam · redo). Fixed light "Studious" palette — moods and the
// orientation toggle are retired. Desktop/wide-screen only for now.
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "@/lib/firebase/client";
import type { Topic } from "@/lib/course/types";
import { topicLessons, lessonKey } from "@/lib/course/lessons";
import { buildConceptPool } from "@/lib/course/concepts";
import { listBuiltinBundles } from "@/lib/course";
import { useCourse } from "@/lib/learn/use-course";
import { loadProgress, loadExamSummary, type LearnProgress } from "@/lib/learn/progress";
import { loadPracticeState } from "@/lib/learn/practice";
import { loadFlags } from "@/lib/learn/flags";
import { loadMistakes } from "@/lib/learn/mistakes";
import AddMaterial from "@/app/learn/components/AddMaterial";
import OpeningAnimation from "@/app/learn/components/OpeningAnimation";
import { useEntitlement } from "@/lib/use-entitlement";
import { hasSummit, hasClimb, LOCKED, TIER_LABEL } from "@/lib/entitlement";

// ── Studious palette (fixed) ──────────────────────────────────────────
const T = {
  ink: "#16202b", inkSoft: "#46566a", faint: "#8593a3",
  bg: "#eef1f4", bgDeep: "#e5e8ec", card: "#ffffff", line: "#dce2e8",
  kube: "#1f6f6b", kubeSoft: "#e2f0ef", kubeLine: "#b4d8d5",
  amber: "#d98a1f", amberSoft: "#f8ecd7", amberLine: "#eccb85",
  red: "#c9463a", redSoft: "#f7e2df",
  display: "'Fraunces',Georgia,serif",
  body: "'Inter',ui-sans-serif,system-ui,sans-serif",
  mono: "'JetBrains Mono',ui-monospace,monospace",
};
// Each section/unit gets its own hue so a swipe into a new unit reads instantly.
const SECTION_COLORS = ["#1f6f6b", "#2b6ca0", "#3d7a4a", "#6f5aa6", "#a06a1c", "#b0524a", "#7d4a86"];
function mix(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const R = Math.round(r + (255 - r) * amt), G = Math.round(g + (255 - g) * amt), B = Math.round(b + (255 - b) * amt);
  return `rgb(${R}, ${G}, ${B})`;
}

type NodeState = "completed" | "current" | "available" | "locked";

function nodeStates(ladder: Topic[], progress: LearnProgress): Record<string, NodeState> {
  const states: Record<string, NodeState> = {};
  let currentAssigned = false;
  for (const t of ladder) {
    if (progress.completed[t.id]) { states[t.id] = "completed"; continue; }
    const unlocked = t.deps.every((d) => progress.completed[d]);
    if (unlocked && !currentAssigned) { states[t.id] = "current"; currentAssigned = true; }
    else if (unlocked) states[t.id] = "available";
    else states[t.id] = "locked";
  }
  if (!currentAssigned && ladder.length && !progress.completed[ladder[0].id]) states[ladder[0].id] = "current";
  return states;
}

function polar(c: number, r: number, deg: number) {
  const a = ((deg - 90) * Math.PI) / 180;
  return { x: c + r * Math.cos(a), y: c + r * Math.sin(a) };
}
function buildSegs(total: number, done: number, color: string) {
  if (total < 2) return [] as { d: string; stroke: string }[];
  const c = 36, r = 32, gap = Math.min(10, 120 / total), per = 360 / total;
  const out: { d: string; stroke: string }[] = [];
  for (let i = 0; i < total; i++) {
    const a0 = i * per + gap / 2, a1 = (i + 1) * per - gap / 2, p0 = polar(c, r, a0), p1 = polar(c, r, a1);
    const large = a1 - a0 > 180 ? 1 : 0;
    out.push({ d: `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`, stroke: i < done ? color : T.line });
  }
  return out;
}

const CHECK = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const LOCK = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden><rect x="5" y="10" width="14" height="10" rx="2" stroke={T.faint} strokeWidth="2" /><path d="M8 10V7a4 4 0 018 0v3" stroke={T.faint} strokeWidth="2" /></svg>
);

const NAV_ICONS: Record<string, React.ReactNode> = {
  Learn: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M4 11.5 12 4l8 7.5" /><path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9" /></svg>,
  Practice: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8h12l-3-3M20 16H8l3 3" /></svg>,
  Notes: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M4 4h7v16H5a1 1 0 0 1-1-1V4z" /><path d="M11 4h8a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-8V4z" /><path d="M7 9h1M14 9h3M14 13h3" strokeLinecap="round" /></svg>,
};

interface SubjectRow { id: string; code: string; title: string; badge: string; }

export default function CourseLadderPage() {
  const params = useParams<{ courseId: string }>();
  const { user, userLoading, status, bundle, owned, syllabus, files, reload } = useCourse(params.courseId);
  const router = useRouter();
  const [progress, setProgress] = useState<LearnProgress | null>(null);
  const [hub, setHub] = useState<{ due: number; best: number; tries: number; notes: number; redo: number } | null>(null);
  const [subjectList, setSubjectList] = useState<SubjectRow[]>([]);
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [viewSection, setViewSection] = useState(0);
  const [opening, setOpening] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  // Access. While it's still loading (null) we render unlocked so an entitled
  // user never sees a flash of glass; the server is the real gate regardless.
  const { entitlement } = useEntitlement();
  const entLoaded = entitlement !== null;
  const summit = !entLoaded || hasSummit(entitlement ?? LOCKED); // may climb
  const climb = !entLoaded || hasClimb(entitlement ?? LOCKED); // cram gym / build

  // Opening title: plays on app entry (first dashboard mount this tab) and
  // whenever a lesson set the replay flag on its way back.
  useEffect(() => {
    try {
      const seen = sessionStorage.getItem("kube-open-seen");
      const replay = sessionStorage.getItem("kube-open-replay");
      if (!seen || replay) {
        setOpening(true);
        sessionStorage.setItem("kube-open-seen", "1");
        sessionStorage.removeItem("kube-open-replay");
      }
    } catch { /* private mode — skip the intro */ }
  }, []);

  useEffect(() => {
    if (!userLoading && !user) router.replace("/login");
    if (user && bundle) loadProgress(user.uid, bundle.course.id).then(setProgress);
  }, [user, userLoading, router, bundle]);

  // Subject switcher list — built-ins the account can see + its own courses.
  useEffect(() => {
    if (!user) return;
    (async () => {
      const builtin = listBuiltinBundles(user.email).map((b) => ({
        id: b.course.id, code: b.course.code, title: b.course.title,
        badge: b.course.code.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase() || "K",
      }));
      let mine: SubjectRow[] = [];
      try {
        const snap = await getDocs(query(collection(db(), "courses"), where("userId", "==", user.uid)));
        mine = snap.docs.map((d) => {
          const code = (d.get("code") as string) || "";
          return { id: d.id, code, title: (d.get("title") as string) || "", badge: code.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase() || "K" };
        });
      } catch { /* built-ins alone are fine */ }
      setSubjectList([...builtin, ...mine]);
    })();
  }, [user]);

  useEffect(() => {
    if (!user || !bundle) return;
    const cid = bundle.course.id;
    const pool = buildConceptPool(bundle);
    (async () => {
      const [practice, exam, flags, mistakes] = await Promise.all([
        loadPracticeState(user.uid, cid), loadExamSummary(user.uid, cid), loadFlags(user.uid, cid), loadMistakes(user.uid, cid),
      ]);
      const now = Date.now();
      const due = pool.filter((c) => (practice.cards[c.id]?.dueAt ?? 0) <= now).length;
      const redo = new Set([...Object.keys(mistakes), ...Object.keys(flags)]).size;
      setHub({ due, best: exam.best, tries: exam.tries, notes: pool.length, redo });
    })();
  }, [user, bundle]);

  // Find-me-on-load: bring the current node into view after render.
  useEffect(() => {
    if (!progress || !bundle) return;
    const t = setTimeout(() => {
      document.querySelector("[data-kube-current]")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 250);
    return () => clearTimeout(t);
  }, [progress, bundle]);

  const onScroll = () => {
    const m = mainRef.current;
    if (!m) return;
    const heads = m.querySelectorAll("[data-sec-idx]");
    const mTop = m.getBoundingClientRect().top;
    let idx = 0;
    heads.forEach((h) => { if ((h as HTMLElement).getBoundingClientRect().top - mTop <= 190) idx = +(h as HTMLElement).dataset.secIdx!; });
    if (idx !== viewSection) setViewSection(idx);
  };

  if (status === "notfound") {
    return (
      <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center", background: T.bgDeep, fontFamily: T.body }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: T.faint }}>That course isn&apos;t in Kube yet.</p>
          <Link href="/learn" style={{ marginTop: 12, display: "inline-block", fontWeight: 600, color: T.kube }}>← your subjects</Link>
        </div>
      </div>
    );
  }

  const loading = userLoading || !user || status === "loading" || !bundle || !progress;

  const course = bundle?.course;
  const ladder = bundle?.ladder ?? [];
  const states = progress ? nodeStates(ladder, progress) : {};
  const done = progress ? ladder.filter((t) => progress.completed[t.id]).length : 0;
  const total = ladder.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const fi = ladder.findIndex((n) => !progress?.completed[n.id]);
  const curTopic = fi >= 0 ? ladder[fi] : ladder[ladder.length - 1];

  // Rows: fed sections + syllabus units not yet fed (expectant placeholders).
  const fedUnits = new Set((course?.sections ?? []).map((s) => s.unit));
  const rows = [
    ...(course?.sections ?? []).map((s, i) => ({ type: "section" as const, unit: s.unit, section: s, idx: i })),
    ...((syllabus?.units ?? []).filter((u) => !fedUnits.has(u.unit)).map((u) => ({ type: "skeleton" as const, unit: u.unit, title: u.title, idx: -1 }))),
  ].sort((a, b) => a.unit - b.unit);

  const vs = (course?.sections ?? [])[viewSection] || (course?.sections ?? [])[0];
  const secColor = SECTION_COLORS[viewSection % SECTION_COLORS.length];
  const circ = 2 * Math.PI * 30;

  let nodeSeq = 0; // for the zig-zag sine offset

  return (
    <div style={{ display: "flex", height: "100dvh", width: "100%", background: T.bgDeep, color: T.ink, fontFamily: T.body, overflow: "hidden" }}>
      {opening && <OpeningAnimation accent={T.kube} onDone={() => setOpening(false)} />}

      {/* ── Left sidebar ── */}
      <aside style={{ width: 256, flex: "none", background: T.card, borderRight: `1px solid ${T.line}`, display: "flex", flexDirection: "column", padding: "22px 14px 16px" }}>
        <div style={{ display: "flex", alignItems: "baseline", padding: "4px 10px 22px", fontFamily: T.display, fontWeight: 600, fontSize: 23, letterSpacing: "-.02em", lineHeight: 1 }}>
          <span style={{ color: T.ink }}>Studying</span><span style={{ color: T.kube }}>Kube</span>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {([["Learn", `/learn/${params.courseId}`, true], ["Practice", `/learn/${params.courseId}/practice`, false], ["Notes", `/learn/${params.courseId}/glossary`, false]] as const).map(([label, href, active]) => (
            <Link key={label} href={href} style={{ display: "flex", alignItems: "center", gap: 14, padding: "11px 14px", borderRadius: 13, fontFamily: T.mono, fontWeight: 600, fontSize: 12.5, letterSpacing: ".06em", textTransform: "uppercase", color: active ? T.kube : T.faint, background: active ? T.kubeSoft : "transparent", boxShadow: active ? `inset 0 0 0 1.5px ${T.kubeLine}` : "none" }}>
              <span style={{ display: "grid", placeItems: "center", width: 24, height: 24 }}>{NAV_ICONS[label]}</span>
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <div style={{ marginTop: "auto", paddingTop: 16, borderTop: `1px solid ${T.line}`, display: "flex", alignItems: "center", gap: 8 }}>
          <Link href="/learn" style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 11, padding: "9px 10px", borderRadius: 13 }}>
            <span style={{ flex: "none", display: "grid", placeItems: "center", width: 38, height: 38, borderRadius: "50%", background: T.kube, color: "#fff", fontFamily: T.display, fontWeight: 600, fontSize: 15 }}>
              {(user?.email?.[0] || "K").toUpperCase()}
            </span>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: "block", fontWeight: 600, fontSize: 13.5, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.email?.split("@")[0] || "Kube learner"}</span>
              <span style={{ display: "block", fontFamily: T.mono, fontSize: 10, letterSpacing: ".04em", color: T.faint }}>Your subjects</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={async () => { await signOut(auth()); window.location.assign("/login"); }}
            title="Sign out"
            aria-label="Sign out"
            style={{ flex: "none", display: "grid", placeItems: "center", width: 38, height: 38, borderRadius: 12, border: `1px solid ${T.line}`, background: T.card, color: T.faint, cursor: "pointer" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>
          </button>
        </div>
      </aside>

      {/* ── Centre column ── */}
      <main ref={mainRef} onScroll={onScroll} style={{ flex: 1, minWidth: 0, overflowY: "auto", position: "relative" }}>
        {/* Sticky header */}
        <div style={{ position: "sticky", top: 0, zIndex: 40, padding: "16px 32px", background: T.bgDeep }}>
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10, marginBottom: 12 }}>
            {owned && (
              <Link href={`/learn/${params.courseId}/manage`} title="Add files, rename, or delete" style={{ display: "flex", alignItems: "center", gap: 8, background: T.card, border: `1px solid ${T.line}`, borderRadius: 14, padding: "10px 14px", color: T.inkSoft, fontFamily: T.mono, fontWeight: 600, fontSize: 11.5, letterSpacing: ".06em", textTransform: "uppercase" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>
                Add / manage
              </Link>
            )}
            <div style={{ position: "relative" }}>
              <button onClick={() => setSubjectOpen((v) => !v)} style={{ display: "flex", alignItems: "center", gap: 11, background: T.card, border: `1px solid ${T.line}`, borderRadius: 14, padding: "8px 12px", cursor: "pointer" }}>
                <span style={{ flex: "none", display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: 9, background: T.kubeSoft, color: T.kube, fontFamily: T.mono, fontWeight: 600, fontSize: 11 }}>
                  {(course?.code || "").replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase() || "K"}
                </span>
                <span style={{ textAlign: "left" }}>
                  <span style={{ display: "block", fontFamily: T.mono, fontSize: 9.5, letterSpacing: ".14em", textTransform: "uppercase", color: T.faint }}>Subject</span>
                  <span style={{ display: "block", fontFamily: T.display, fontWeight: 600, fontSize: 16, color: T.ink, lineHeight: 1.1 }}>{course?.code || "…"}</span>
                </span>
                <span style={{ display: "grid", placeItems: "center", transition: "transform .16s ease", transform: subjectOpen ? "rotate(180deg)" : "none" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.faint} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                </span>
              </button>
              {subjectOpen && (
                <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 308, zIndex: 60, background: T.card, border: `1px solid ${T.line}`, borderRadius: 18, padding: 8, boxShadow: "0 24px 50px -20px rgba(15,32,50,.4),0 3px 10px rgba(15,32,50,.08)" }}>
                  <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: T.faint, padding: "8px 10px 6px" }}>My subjects</div>
                  {subjectList.map((s) => (
                    <Link key={s.id} href={`/learn/${s.id}`} onClick={() => setSubjectOpen(false)} style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 10px", borderRadius: 12, background: s.id === course?.id ? T.kubeSoft : "transparent" }}>
                      <span style={{ flex: "none", display: "grid", placeItems: "center", width: 36, height: 36, borderRadius: 10, background: T.kubeSoft, color: T.kube, fontFamily: T.mono, fontWeight: 600, fontSize: 11 }}>{s.badge}</span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: "block", fontWeight: 600, fontSize: 13.5, color: T.ink }}>{s.code}</span>
                        <span style={{ display: "block", fontSize: 11.5, color: T.inkSoft, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.title}</span>
                      </span>
                      {s.id === course?.id && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.kube} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>}
                    </Link>
                  ))}
                  <Link href="/learn/new" onClick={() => setSubjectOpen(false)} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 10px", marginTop: 4, borderTop: `1px solid ${T.line}`, color: T.kube, fontWeight: 600, fontSize: 13 }}>
                    <span style={{ flex: "none", display: "grid", placeItems: "center", width: 36, height: 36, borderRadius: 10, border: `1.5px dashed ${T.kubeLine}`, fontSize: 20, lineHeight: 1 }}>+</span>
                    Add a subject
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Coloured unit banner */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, background: secColor, borderRadius: 18, padding: "18px 22px", boxShadow: "0 6px 0 rgba(20,32,43,.16)", transition: "background .4s ease" }}>
            <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
              <div style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 600, letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(255,255,255,.72)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {vs ? `Section ${vs.letter} · Unit ${vs.unit}` : course?.title}
              </div>
              <div style={{ fontFamily: T.display, fontWeight: 600, fontSize: "clamp(18px,2.1vw,26px)", lineHeight: 1.12, letterSpacing: "-.02em", color: "#fff", marginTop: 3, overflowWrap: "anywhere", wordBreak: "break-word" }}>
                {vs ? vs.title : course?.title}
              </div>
            </div>
            {vs && (
              <Link href={`/learn/${params.courseId}/glossary`} style={{ flex: "none", alignSelf: "flex-end", display: "flex", alignItems: "center", gap: 9, background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.28)", color: "#fff", borderRadius: 12, padding: "11px 16px", fontFamily: T.mono, fontWeight: 600, fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M4 5a1 1 0 0 1 1-1h6v16H5a1 1 0 0 1-1-1z" /><path d="M20 5a1 1 0 0 0-1-1h-6v16h6a1 1 0 0 0 1-1z" /></svg>
                Recap
              </Link>
            )}
          </div>
          {/* Climb bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 13 }}>
            <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: T.faint, whiteSpace: "nowrap" }}>Your climb</span>
            <div style={{ flex: 1, height: 9, borderRadius: 999, background: T.line, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, borderRadius: 999, background: T.kube, transition: "width .6s cubic-bezier(.22,1,.36,1)" }} />
            </div>
            <span style={{ whiteSpace: "nowrap", fontFamily: T.mono, fontSize: 12, fontWeight: 600, color: T.kube }}>{done}<span style={{ color: T.faint, fontWeight: 400 }}> / {total}</span></span>
          </div>
        </div>

        {/* Ladder */}
        <div style={{ padding: "4px 32px 90px", display: "flex", flexDirection: "column", alignItems: "stretch" }}>
          {loading ? (
            <div style={{ height: 260, display: "grid", placeItems: "center", color: T.faint, fontSize: 14 }}>Loading your path…</div>
          ) : rows.map((row) =>
            row.type === "skeleton" ? (
              <section key={`sk-${row.unit}`} style={{ marginTop: 26 }}>
                <div style={{ position: "sticky", top: 8, zIndex: 20, borderRadius: 12, border: `2px dashed ${T.line}`, background: T.bg, padding: "14px 18px" }}>
                  <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: T.faint }}>Unit {row.unit} · not fed yet</span>
                  <h2 style={{ fontFamily: T.display, fontWeight: 600, fontSize: 18, color: T.faint, marginTop: 4 }}>{row.title}</h2>
                  <p style={{ fontSize: 13, color: T.faint, marginTop: 4 }}>{owned ? "Kube's expecting this — add its file below and the node lights up." : "Kube's expecting this — it lights up when its material is fed in."}</p>
                </div>
              </section>
            ) : (() => {
              const s = row.section;
              const si = row.idx;
              const secMain = SECTION_COLORS[si % SECTION_COLORS.length];
              const secLine = mix(secMain, 0.55), secSoft = mix(secMain, 0.86);
              const secDone = s.topics.filter((t) => progress!.completed[t.id]).length;
              return (
                <section key={s.id} data-sec-idx={si} style={{ marginTop: 26 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "0 0 6px" }}>
                    <span style={{ flex: 1, height: 1, background: secLine }} />
                    <span style={{ textAlign: "center" }}>
                      <span style={{ display: "block", fontFamily: T.mono, fontSize: 10, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: secMain }}>Section {s.letter} · Unit {s.unit} · {secDone}/{s.topics.length}</span>
                      <span style={{ display: "block", fontFamily: T.display, fontWeight: 600, fontSize: 18, color: T.ink, marginTop: 2 }}>{s.title}</span>
                    </span>
                    <span style={{ flex: 1, height: 1, background: secLine }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 18 }}>
                    {s.topics.map((tp) => {
                      const st = states[tp.id];
                      const isReview = tp.kind === "review";
                      const size = isReview ? 48 : 56;
                      const lessons = topicLessons(tp);
                      const tot = lessons.length;
                      const lDone = st === "completed" ? tot : lessons.filter((l) => progress!.lessons[lessonKey(tp.id, l.id)]).length;
                      const off = Math.round(Math.sin(nodeSeq * 0.7) * 70); nodeSeq++;
                      const num = bundle!.topicPosition(tp.id) + 1;
                      const hasRing = !isReview && st !== "locked" && tot >= 2;
                      const segs = hasRing ? buildSegs(tot, lDone, secMain) : [];

                      let btn: React.CSSProperties;
                      if (st === "completed") btn = { background: secMain, borderColor: secMain, color: "#fff", boxShadow: "0 4px 0 rgba(20,32,43,.16)" };
                      else if (st === "current") btn = { background: T.amber, borderColor: T.amber, color: "#fff", boxShadow: `0 4px 0 rgba(150,92,16,.5), 0 0 0 8px ${T.amberSoft}` };
                      else if (st === "available") btn = { background: T.card, borderColor: secLine, color: secMain, boxShadow: "0 4px 0 rgba(20,32,43,.10)", borderStyle: isReview ? "dashed" : "solid" };
                      else btn = { background: T.line, borderColor: T.line, color: T.faint };

                      let metaText = "", metaColor = T.faint;
                      if (st !== "locked") {
                        if (isReview) { metaText = "5 questions"; metaColor = secMain; }
                        else if (tot > 1 && st !== "completed") metaText = `${lDone} of ${tot} parts`;
                        else if (tp.weight === "heavy") { metaText = "core"; metaColor = T.amber; }
                      }
                      const actionLabel = st === "locked" ? "Locked" : st === "completed" ? "Practice again" : isReview ? "Start review" : "Start";

                      return (
                        <div key={tp.id} style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", transform: `translateX(${off}px)`, margin: "18px 0" }}>
                          {st === "current" && (
                            <div style={{ position: "absolute", left: "50%", top: -40, transform: "translate(-50%,0)", animation: "kb-bob 2.1s ease-in-out infinite", background: T.amber, color: "#fff", fontFamily: T.mono, fontWeight: 600, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", padding: "5px 11px", borderRadius: 999, boxShadow: "0 3px 0 rgba(180,110,20,.5)", zIndex: 6, whiteSpace: "nowrap" }}>Start</div>
                          )}
                          {selected === tp.id && (
                            <div style={{ position: "absolute", left: "50%", bottom: "calc(100% + 14px)", transform: "translateX(-50%)", width: 214, zIndex: 30, background: T.card, border: `1px solid ${T.line}`, borderRadius: 16, padding: "15px 15px 14px", boxShadow: "0 20px 40px -18px rgba(15,32,50,.4),0 3px 10px rgba(15,32,50,.08)" }}>
                              <div style={{ fontFamily: T.display, fontWeight: 600, fontSize: 15.5, lineHeight: 1.25, color: T.ink }}>{tp.title}</div>
                              {metaText && <div style={{ fontFamily: T.mono, fontSize: 10.5, fontWeight: 500, letterSpacing: ".04em", color: metaColor, marginTop: 5 }}>{metaText}</div>}
                              {st === "locked" ? (
                                <div style={{ width: "100%", marginTop: 12, borderRadius: 12, padding: 11, fontFamily: T.mono, fontWeight: 600, fontSize: 11.5, letterSpacing: ".08em", textTransform: "uppercase", textAlign: "center", background: T.line, color: T.faint }}>Locked</div>
                              ) : !summit ? (
                                // Tree behind glass: shown, warmly not-yet-yours.
                                <div style={{ marginTop: 12 }}>
                                  <div style={{ fontSize: 12, lineHeight: 1.4, color: T.inkSoft }}>Ready when you are — unlock your climb with Summit.</div>
                                  <Link href="/learn/upgrade" style={{ display: "block", width: "100%", marginTop: 10, borderRadius: 12, padding: 11, fontFamily: T.mono, fontWeight: 600, fontSize: 11.5, letterSpacing: ".08em", textTransform: "uppercase", textAlign: "center", background: T.amber, color: "#fff", boxShadow: "0 3px 0 rgba(150,92,16,.4)" }}>Unlock with Summit</Link>
                                </div>
                              ) : (
                                <Link href={`/learn/${params.courseId}/lesson/${tp.id}`} style={{ display: "block", width: "100%", marginTop: 12, borderRadius: 12, padding: 11, fontFamily: T.mono, fontWeight: 600, fontSize: 11.5, letterSpacing: ".08em", textTransform: "uppercase", textAlign: "center", background: st === "completed" ? secSoft : secMain, color: st === "completed" ? secMain : "#fff", boxShadow: "0 3px 0 rgba(20,32,43,.16)" }}>{actionLabel}</Link>
                              )}
                            </div>
                          )}
                          <button
                            onClick={() => setSelected((v) => (v === tp.id ? null : tp.id))}
                            {...(st === "current" ? { "data-kube-current": "" } : {})}
                            style={{ width: size, height: size, borderRadius: "50%", border: "2px solid", display: "grid", placeItems: "center", position: "relative", padding: 0, fontFamily: T.body, fontWeight: 700, fontSize: 17, cursor: st === "locked" ? "default" : "pointer", transition: "transform .15s ease", ...btn }}
                          >
                            {hasRing && (
                              <svg width={size + 16} height={size + 16} viewBox="0 0 72 72" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }}>
                                {segs.map((seg, i) => <path key={i} d={seg.d} fill="none" stroke={seg.stroke} strokeWidth="4.5" strokeLinecap="round" />)}
                              </svg>
                            )}
                            <span style={{ display: "grid", placeItems: "center" }}>
                              {st === "completed" ? CHECK : st === "locked" ? LOCK : isReview ? <span style={{ fontSize: 20, lineHeight: 1 }}>↻</span> : <span>{num}</span>}
                            </span>
                          </button>
                          <div style={{ marginTop: 9, maxWidth: 150, textAlign: "center", fontSize: 12.5, fontWeight: 600, lineHeight: 1.25, color: st === "locked" ? T.faint : T.ink }}>{tp.title}</div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })()
          )}

          {!loading && owned && climb && (
            <div style={{ marginTop: 8 }}>
              <AddMaterial courseId={course!.id} uid={user!.uid} files={files} onDone={reload} invitation={ladder.length === 0 && !syllabus} courseTitle={course!.title} />
            </div>
          )}
          {!loading && owned && !climb && entLoaded && (
            <div style={{ marginTop: 8, background: T.kubeSoft, border: `1px solid ${T.kubeLine}`, borderRadius: 18, padding: "18px 20px", textAlign: "center" }}>
              <div style={{ fontFamily: T.display, fontWeight: 600, fontSize: 16, color: T.ink }}>Add material with Kube</div>
              <p style={{ fontSize: 13, lineHeight: 1.5, color: T.inkSoft, margin: "6px 0 0" }}>Redeem a code (or start a plan) to feed Kube your units and build the tree.</p>
              <Link href="/learn/upgrade" style={{ display: "inline-block", marginTop: 12, background: T.kube, color: "#fff", borderRadius: 12, padding: "10px 18px", fontFamily: T.mono, fontWeight: 600, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase" }}>Unlock Kube</Link>
            </div>
          )}
        </div>
      </main>

      {/* ── Right rail ── */}
      <aside style={{ width: 352, flex: "none", background: T.bgDeep, borderLeft: `1px solid ${T.line}`, overflowY: "auto", padding: "24px 22px", display: "flex", flexDirection: "column", gap: 18 }}>
        {(!entLoaded || summit) ? (
          // Active plan — calm, no hard sell. Optimistic while entitlement
          // loads (like the rest of the page) so a Summit user never flashes
          // the upsell card.
          <div style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: 18, padding: 20 }}>
            <span style={{ display: "inline-block", background: T.kube, color: "#fff", fontFamily: T.mono, fontWeight: 600, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 7 }}>{entitlement?.tier ? TIER_LABEL[entitlement.tier] : "Kube Summit"}</span>
            <div style={{ fontFamily: T.display, fontWeight: 600, fontSize: 18, color: T.ink, marginTop: 12 }}>Your climb is unlocked.</div>
            <p style={{ fontSize: 13, lineHeight: 1.5, color: T.inkSoft, margin: "6px 0 0" }}>
              {entitlement?.expiresAt
                ? `Yours through ${new Date(entitlement.expiresAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}.`
                : "Every circle, the tutor, and your plan — all on."}
            </p>
          </div>
        ) : (
          // Tree behind glass — warm upsell, never a scold.
          <div style={{ background: T.kubeSoft, border: `1px solid ${T.kubeLine}`, borderRadius: 18, padding: 20 }}>
            <span style={{ display: "inline-block", background: T.kube, color: "#fff", fontFamily: T.mono, fontWeight: 600, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 7 }}>Kube Summit</span>
            <div style={{ fontFamily: T.display, fontWeight: 600, fontSize: 19, color: T.ink, marginTop: 13 }}>Ready when you are.</div>
            <p style={{ fontSize: 13.5, lineHeight: 1.5, color: T.inkSoft, margin: "7px 0 0" }}>Your tree is built and waiting. Summit turns every circle tappable — the full teaching, your daily plan, and the tutor on tap.</p>
            <Link href="/learn/upgrade" style={{ display: "block", textAlign: "center", width: "100%", marginTop: 16, background: T.kube, color: "#fff", border: "none", borderRadius: 13, padding: 13, fontFamily: T.mono, fontWeight: 600, fontSize: 12.5, letterSpacing: ".1em", textTransform: "uppercase", cursor: "pointer", boxShadow: "0 4px 0 rgba(20,32,43,.18)" }}>Unlock with Summit</Link>
          </div>
        )}

        <div style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: 18, padding: 20 }}>
          <span style={{ fontFamily: T.mono, fontWeight: 600, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: T.faint }}>{course?.code} · your climb</span>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 14 }}>
            <svg width="72" height="72" viewBox="0 0 72 72" style={{ flex: "none" }}>
              <circle cx="36" cy="36" r="30" fill="none" stroke={T.line} strokeWidth="8" />
              <circle cx="36" cy="36" r="30" fill="none" stroke={T.kube} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(circ * pct / 100).toFixed(1)} ${circ.toFixed(1)}`} transform="rotate(-90 36 36)" />
            </svg>
            <div>
              <div style={{ fontFamily: T.display, fontWeight: 600, fontSize: 22, color: T.ink }}>{done}<span style={{ color: T.faint, fontSize: 15 }}> / {total}</span></div>
              <div style={{ fontSize: 13, color: T.inkSoft, marginTop: 2 }}>topics climbed</div>
            </div>
          </div>
          {curTopic && (
            <Link href={summit ? `/learn/${params.courseId}/lesson/${curTopic.id}` : "/learn/upgrade"} style={{ display: "block", width: "100%", marginTop: 16, background: summit ? T.kube : T.amber, color: "#fff", borderRadius: 13, padding: "13px 14px", fontFamily: T.mono, fontWeight: 600, fontSize: 11.5, letterSpacing: ".06em", textTransform: "uppercase", textAlign: "center", boxShadow: summit ? "0 4px 0 rgba(20,32,43,.18)" : "0 4px 0 rgba(150,92,16,.4)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{summit ? `Continue: ${curTopic.title}` : "Unlock with Summit"}</Link>
          )}
        </div>

        <Link href={`/learn/${params.courseId}/exam`} style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: 18, padding: "18px 20px", display: "flex", gap: 13, alignItems: "flex-start" }}>
          <span style={{ flex: "none", display: "grid", placeItems: "center", width: 44, height: 44, borderRadius: 12, background: T.amberSoft }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={T.amber} strokeWidth="2" strokeLinejoin="round"><path d="M6 4h9l3 3v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" /><path d="M9 13.5l2 2 4-4" strokeLinecap="round" /></svg>
          </span>
          <span>
            <span style={{ display: "block", fontFamily: T.display, fontWeight: 600, fontSize: 17, color: T.ink }}>Mock exam</span>
            <span style={{ display: "block", fontSize: 13, lineHeight: 1.5, color: T.inkSoft, marginTop: 4 }}>{hub == null ? "Past-paper questions across the whole course." : hub.tries > 0 ? `Best ${hub.best}% · try #${hub.tries + 1} — sit it again.` : "First attempt not taken — sit the past-paper set."}</span>
          </span>
        </Link>

        <Link href={`/learn/${params.courseId}/mistakes`} style={{ background: T.card, border: `1px solid ${hub && hub.redo > 0 ? T.red : T.line}`, borderRadius: 18, padding: "18px 20px", display: "flex", gap: 13, alignItems: "flex-start" }}>
          <span style={{ flex: "none", display: "grid", placeItems: "center", width: 44, height: 44, borderRadius: 12, background: T.redSoft }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={T.red} strokeWidth="2" strokeLinejoin="round"><path d="M12 3l9 16H3l9-16z" /><path d="M12 10v4M12 17v.5" strokeLinecap="round" /></svg>
          </span>
          <span>
            <span style={{ display: "block", fontFamily: T.display, fontWeight: 600, fontSize: 17, color: T.ink }}>{hub && hub.redo > 0 ? `${hub.redo} to redo` : "Mistakes & flags"}</span>
            <span style={{ display: "block", fontSize: 13, lineHeight: 1.5, color: T.inkSoft, marginTop: 4 }}>Missed &amp; flagged questions from your mistakes, waiting to be cleared.</span>
          </span>
        </Link>
      </aside>
    </div>
  );
}
