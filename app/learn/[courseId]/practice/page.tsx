"use client";

// The Practice Hub — rebuilt to the KubeLearn three-column app shell
// (KubePractice.dc.html) to match the dashboard: left nav rail, centre gym
// (header · "draw from" chips · resume banner · 2×2 tool cards) or the open
// tool, and a right rail (Kube Pro · your gym stats · weak spots). The four
// tools (Matching/Definitions/Flashcards/Sprint) are the existing working
// components. Stats are wired to real practice data; streak/weekly activity
// need session logging we haven't built, so they're intentionally omitted
// rather than faked.
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "@/lib/firebase/client";
import { useCourse } from "@/lib/learn/use-course";
import { listBuiltinBundles } from "@/lib/course";
import { useEntitlement } from "@/lib/use-entitlement";
import { hasSummit, LOCKED, TIER_LABEL } from "@/lib/entitlement";
import { useCramLocked, CramLocked } from "@/app/learn/components/PlanGate";
import { buildConceptPool, sprintItems } from "@/lib/course/concepts";
import { loadPracticeState, type CardState } from "@/lib/learn/practice";
import Matching from "./Matching";
import Definitions from "./Definitions";
import Flashcards from "./Flashcards";
import Sprint from "./Sprint";
import MobileTabs, { MOBILE_TABS_H } from "@/app/learn/components/MobileTabs";
import { useIsMobile } from "@/lib/use-media";

const T = {
  ink: "#16202b", inkSoft: "#46566a", faint: "#8593a3",
  bg: "#eef1f4", bgDeep: "#e5e8ec", card: "#ffffff", line: "#dce2e8",
  kube: "#1f6f6b", kubeSoft: "#e2f0ef", kubeLine: "#b4d8d5",
  amber: "#d98a1f", amberSoft: "#f8ecd7", red: "#c9463a", redSoft: "#f7e2df",
  display: "'Fraunces',Georgia,serif", body: "'Inter',ui-sans-serif,system-ui,sans-serif",
  mono: "'JetBrains Mono',ui-monospace,monospace",
};

const NAV_ICONS: Record<string, React.ReactNode> = {
  Learn: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M4 11.5 12 4l8 7.5" /><path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9" /></svg>,
  Practice: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8h12l-3-3M20 16H8l3 3" /></svg>,
  Notes: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M4 4h7v16H5a1 1 0 0 1-1-1V4z" /><path d="M11 4h8a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-8V4z" /><path d="M7 9h1M14 9h3M14 13h3" strokeLinecap="round" /></svg>,
};

const TOOL_ICONS = {
  matching: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8h12l-3-3M20 16H8l3 3" /></svg>,
  definitions: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20l1-4L16 5l3 3L8 19z" /><path d="M14 7l3 3" /></svg>,
  flashcards: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><rect x="4" y="7" width="12" height="14" rx="2.5" /><path d="M8 4.5h9A2.5 2.5 0 0 1 19.5 7v11" /></svg>,
  sprint: <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6z" /></svg>,
};
const ARROW = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h13M13 6l6 6-6 6" /></svg>;

type Tool = "matching" | "definitions" | "flashcards" | "sprint";
interface ToolDef { id: Tool; title: string; blurb: string; color: string; tint: string; cta: string; }
const TOOLS: ToolDef[] = [
  { id: "matching", title: "Matching", blurb: "Tell confusables apart — snap each term to its pair.", color: "#1f6f6b", tint: "#e2f0ef", cta: "Play" },
  { id: "definitions", title: "Definitions", blurb: "Recall it in your own words — Kube grades at your level.", color: "#6f5aa6", tint: "#ece7f5", cta: "Recall" },
  { id: "flashcards", title: "Flashcards", blurb: "Flip & swipe — the deck learns your weak spots and re-spaces them.", color: "#2b6ca0", tint: "#e2edf5", cta: "Flip" },
  { id: "sprint", title: "Timed Sprint", blurb: "Sixty seconds, one goal: beat your own best run.", color: "#d98a1f", tint: "#f8ecd7", cta: "Sprint" },
];

interface SubjectRow { id: string; code: string; title: string; badge: string; }

export default function PracticePage() {
  const params = useParams<{ courseId: string }>();
  const isMobile = useIsMobile();
  const { user, userLoading, status, bundle } = useCourse(params.courseId);
  const router = useRouter();
  const cramLocked = useCramLocked();
  const { entitlement } = useEntitlement();
  const entLoaded = entitlement !== null;
  const summit = !entLoaded || hasSummit(entitlement ?? LOCKED);

  const [tool, setTool] = useState<Tool | null>(null);
  const [cards, setCards] = useState<Record<string, CardState>>({});
  const [best, setBest] = useState(0);
  const [ready, setReady] = useState(false);
  const [unit, setUnit] = useState<number | "auto">("auto");
  const [subjectList, setSubjectList] = useState<SubjectRow[]>([]);
  const [subjectOpen, setSubjectOpen] = useState(false);

  const fullPool = useMemo(() => (bundle ? buildConceptPool(bundle) : []), [bundle]);
  const fullItems = useMemo(() => (bundle ? sprintItems(bundle) : []), [bundle]);
  const units = useMemo(() => [...new Set(fullPool.map((c) => c.unit))].sort((a, b) => a - b), [fullPool]);
  const pool = useMemo(() => (unit === "auto" ? fullPool : fullPool.filter((c) => c.unit === unit)), [fullPool, unit]);
  const items = useMemo(() => (unit === "auto" ? fullItems : fullItems.filter((q) => q.unit === unit)), [fullItems, unit]);

  useEffect(() => {
    if (!userLoading && !user) router.replace("/");
    if (user && bundle) {
      loadPracticeState(user.uid, bundle.course.id).then((s) => {
        setCards(s.cards);
        setBest(s.sprintBest);
        setReady(true);
      });
    }
  }, [user, userLoading, router, bundle]);

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

  // ── real gym stats ──
  const now = Date.now();
  const due = fullPool.filter((c) => (cards[c.id]?.dueAt ?? 0) <= now).length;
  const learned = Object.values(cards).filter((c) => c.reps > 0).length;
  // Weak spots: practised concepts with the lowest SM-2 ease (1.6 struggled → 2.8 solid).
  const weak = useMemo(() => {
    const seen = fullPool.filter((c) => (cards[c.id]?.reps ?? 0) > 0);
    return seen
      .map((c) => ({ c, ease: cards[c.id].ease }))
      .sort((a, b) => a.ease - b.ease)
      .slice(0, 3)
      .map(({ c, ease }) => ({
        name: c.term, unit: c.unit,
        pct: Math.max(30, Math.min(96, Math.round(30 + ((ease - 1.6) / 1.2) * 62))),
      }));
  }, [fullPool, cards]);

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
  if (userLoading || !user || !bundle || !ready) {
    return <div className="flex-1 grid place-items-center text-sm" style={{ color: "var(--faint)" }}>Loading the gym…</div>;
  }
  if (cramLocked) return <CramLocked feature="The practice gym" />;

  const { course } = bundle;
  const badge = course.code.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase() || "K";

  const openTool = (t: Tool) => { setTool(t); };

  return (
    <div style={{ display: "flex", height: "100dvh", width: "100%", background: T.bgDeep, color: T.ink, fontFamily: T.body, overflow: "hidden" }}>
      {/* ── Left sidebar ── */}
      {!isMobile && (
      <aside style={{ width: 256, flex: "none", background: T.card, borderRight: `1px solid ${T.line}`, display: "flex", flexDirection: "column", padding: "22px 14px 16px" }}>
        <div style={{ display: "flex", alignItems: "baseline", padding: "4px 10px 22px", fontFamily: T.display, fontWeight: 600, fontSize: 23, letterSpacing: "-.02em", lineHeight: 1 }}>
          <span style={{ color: T.ink }}>Studying</span><span style={{ color: T.kube }}>Kube</span>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {([["Learn", `/learn/${params.courseId}`, false], ["Practice", `/learn/${params.courseId}/practice`, true], ["Notes", `/learn/${params.courseId}/glossary`, false]] as const).map(([label, href, active]) => (
            <Link key={label} href={href} style={{ display: "flex", alignItems: "center", gap: 14, padding: "11px 14px", borderRadius: 13, fontFamily: T.mono, fontWeight: 600, fontSize: 12.5, letterSpacing: ".06em", textTransform: "uppercase", color: active ? T.kube : T.faint, background: active ? T.kubeSoft : "transparent", boxShadow: active ? `inset 0 0 0 1.5px ${T.kubeLine}` : "none" }}>
              <span style={{ display: "grid", placeItems: "center", width: 24, height: 24 }}>{NAV_ICONS[label]}</span>
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <div style={{ marginTop: "auto", paddingTop: 16, borderTop: `1px solid ${T.line}`, display: "flex", alignItems: "center", gap: 8 }}>
          <Link href="/learn" style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 11, padding: "9px 10px", borderRadius: 13 }}>
            <span style={{ flex: "none", display: "grid", placeItems: "center", width: 38, height: 38, borderRadius: "50%", background: T.kube, color: "#fff", fontFamily: T.display, fontWeight: 600, fontSize: 15 }}>{(user.email?.[0] || "K").toUpperCase()}</span>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: "block", fontWeight: 600, fontSize: 13.5, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email?.split("@")[0] || "Kube learner"}</span>
              <span style={{ display: "block", fontFamily: T.mono, fontSize: 10, letterSpacing: ".04em", color: T.faint }}>Your subjects</span>
            </span>
          </Link>
          <button type="button" onClick={async () => { await signOut(auth()); window.location.assign("/"); }} title="Sign out" aria-label="Sign out" style={{ flex: "none", display: "grid", placeItems: "center", width: 38, height: 38, borderRadius: 12, border: `1px solid ${T.line}`, background: T.card, color: T.faint, cursor: "pointer" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>
          </button>
        </div>
      </aside>
      )}

      {/* ── Centre ── */}
      <main style={{ flex: 1, minWidth: 0, overflowY: "auto", position: "relative", paddingBottom: isMobile ? MOBILE_TABS_H + 12 : 0 }}>
        {/* subject switcher */}
        <div style={{ position: "sticky", top: 0, zIndex: 40, padding: "16px 40px 14px", background: T.bgDeep, display: "flex", justifyContent: "flex-end" }}>
          <div style={{ position: "relative" }}>
            <button onClick={() => setSubjectOpen((v) => !v)} style={{ display: "flex", alignItems: "center", gap: 11, background: T.card, border: `1px solid ${T.line}`, borderRadius: 14, padding: "8px 12px", cursor: "pointer" }}>
              <span style={{ flex: "none", display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: 9, background: T.kubeSoft, color: T.kube, fontFamily: T.mono, fontWeight: 600, fontSize: 11 }}>{badge}</span>
              <span style={{ textAlign: "left" }}>
                <span style={{ display: "block", fontFamily: T.mono, fontSize: 9.5, letterSpacing: ".14em", textTransform: "uppercase", color: T.faint }}>Subject</span>
                <span style={{ display: "block", fontFamily: T.display, fontWeight: 600, fontSize: 16, color: T.ink, lineHeight: 1.1 }}>{course.code}</span>
              </span>
              <span style={{ display: "grid", placeItems: "center", transition: "transform .16s ease", transform: subjectOpen ? "rotate(180deg)" : "none" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.faint} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
              </span>
            </button>
            {subjectOpen && (
              <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 308, zIndex: 60, background: T.card, border: `1px solid ${T.line}`, borderRadius: 18, padding: 8, boxShadow: "0 24px 50px -20px rgba(15,32,50,.4)" }}>
                <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: T.faint, padding: "8px 10px 6px" }}>My subjects</div>
                {subjectList.map((s) => (
                  <Link key={s.id} href={`/learn/${s.id}/practice`} onClick={() => setSubjectOpen(false)} style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 10px", borderRadius: 12, background: s.id === course.id ? T.kubeSoft : "transparent" }}>
                    <span style={{ flex: "none", display: "grid", placeItems: "center", width: 36, height: 36, borderRadius: 10, background: T.kubeSoft, color: T.kube, fontFamily: T.mono, fontWeight: 600, fontSize: 11 }}>{s.badge}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontWeight: 600, fontSize: 13.5, color: T.ink }}>{s.code}</span>
                      <span style={{ display: "block", fontSize: 11.5, color: T.inkSoft, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.title}</span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {tool ? (
          /* ── Tool view ── */
          <div style={{ maxWidth: 680, margin: "0 auto", padding: isMobile ? "6px 16px 40px" : "6px 40px 90px" }}>
            <button onClick={() => setTool(null)} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "none", border: "none", cursor: "pointer", fontFamily: T.mono, fontWeight: 600, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: T.faint, padding: 0 }}>
              <span style={{ display: "grid", placeItems: "center", transform: "rotate(180deg)" }}>{ARROW}</span> All tools
            </button>
            <div style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 600, letterSpacing: ".18em", textTransform: "uppercase", color: T.kube, marginTop: 16 }}>{course.code} · {TOOLS.find((t) => t.id === tool)!.title}</div>
            <h1 style={{ fontFamily: T.display, fontWeight: 600, fontSize: 34, letterSpacing: "-.02em", lineHeight: 1.05, color: T.ink, margin: "8px 0 0" }}>{TOOLS.find((t) => t.id === tool)!.title}</h1>

            {units.length > 1 && (
              <div className="k-rail" style={{ marginTop: 16, display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
                {(["auto", ...units] as const).map((u) => {
                  const active = unit === u;
                  return (
                    <button key={u} onClick={() => setUnit(u as number | "auto")} style={{ flex: "none", borderRadius: 999, border: `1px solid ${active ? T.kube : T.line}`, background: active ? T.kubeSoft : T.card, color: active ? T.kube : T.inkSoft, padding: "7px 14px", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
                      {u === "auto" ? "All units" : `Unit ${u}`}
                    </button>
                  );
                })}
              </div>
            )}

            <div style={{ marginTop: 18 }}>
              {tool === "matching" && <Matching key={`m-${unit}`} pool={pool} />}
              {tool === "definitions" && <Definitions key={`d-${unit}`} pool={pool} uid={user.uid} courseId={course.id} />}
              {tool === "flashcards" && <Flashcards key={`f-${unit}`} pool={pool} uid={user.uid} courseId={course.id} cards={cards} onCards={setCards} />}
              {tool === "sprint" && <Sprint key={`s-${unit}`} items={items} uid={user.uid} courseId={course.id} best={best} onBest={setBest} />}
            </div>
          </div>
        ) : (
          /* ── Hub ── */
          <div style={{ maxWidth: 880, margin: "0 auto", padding: isMobile ? "6px 16px 40px" : "6px 40px 90px" }}>
            <div style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 600, letterSpacing: ".18em", textTransform: "uppercase", color: T.kube }}>{course.code} · Practice</div>
            <h1 style={{ fontFamily: T.display, fontWeight: 600, fontSize: 44, letterSpacing: "-.02em", lineHeight: 1.02, color: T.ink, margin: "8px 0 0" }}>The practice gym</h1>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: T.inkSoft, margin: "12px 0 0", maxWidth: "60ch" }}>{fullPool.length} concepts from everything you&apos;ve fed this course, gathered for fast drilling — same brain as the lessons, a different door in.</p>

            {units.length > 1 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 22 }}>
                <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: T.faint, marginRight: 2 }}>Draw from</span>
                {(["auto", ...units] as const).map((u) => {
                  const active = unit === u;
                  return (
                    <button key={u} onClick={() => setUnit(u as number | "auto")} style={{ borderRadius: 999, border: `1px solid ${active ? T.kube : T.line}`, background: active ? T.kubeSoft : T.card, color: active ? T.kube : T.inkSoft, padding: "7px 14px", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
                      {u === "auto" ? "All units" : `Unit ${u}`}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Resume banner */}
            {due > 0 && (
              <button onClick={() => openTool("flashcards")} style={{ width: "100%", textAlign: "left", marginTop: 20, display: "flex", alignItems: "center", gap: 16, background: T.kubeSoft, border: `1px solid ${T.kubeLine}`, borderRadius: 18, padding: "16px 20px", cursor: "pointer" }}>
                <span style={{ flex: "none", display: "grid", placeItems: "center", width: 46, height: 46, borderRadius: 13, background: T.kube, color: "#fff" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4l13 8-13 8z" /></svg>
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontFamily: T.mono, fontSize: 10, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: T.kube }}>Pick up where you left off</span>
                  <span style={{ display: "block", fontWeight: 600, fontSize: 15, color: T.ink, marginTop: 2 }}>Flashcards — {due} card{due === 1 ? "" : "s"} due</span>
                </span>
                <span style={{ flex: "none", background: T.kube, color: "#fff", borderRadius: 12, padding: "12px 20px", fontFamily: T.mono, fontWeight: 600, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase", boxShadow: "0 4px 0 rgba(20,32,43,.18)" }}>Resume</span>
              </button>
            )}

            {/* Tool cards */}
            <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 18 }}>
              {TOOLS.map((t) => {
                const stat = t.id === "matching" ? `${pool.length} concepts ready`
                  : t.id === "definitions" ? "3 difficulty levels"
                  : t.id === "flashcards" ? (due > 0 ? `${due} due now` : "all caught up")
                  : best > 0 ? `Best: ${best} correct` : "No runs yet";
                const showBadge = t.id === "flashcards" && due > 0;
                return (
                  <button key={t.id} onClick={() => openTool(t.id)} style={{ textAlign: "left", cursor: "pointer", background: T.card, border: `1px solid ${T.line}`, borderRadius: 20, padding: 22, display: "flex", flexDirection: "column", boxShadow: "0 4px 0 rgba(20,32,43,.06)", fontFamily: T.body }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                      <span style={{ flex: "none", display: "grid", placeItems: "center", width: 52, height: 52, borderRadius: 15, background: t.tint, color: t.color }}>{TOOL_ICONS[t.id]}</span>
                      {showBadge && <span style={{ fontFamily: T.mono, fontWeight: 600, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: "#fff", background: T.amber, padding: "4px 9px", borderRadius: 999 }}>{due} due</span>}
                    </div>
                    <div style={{ fontFamily: T.display, fontWeight: 600, fontSize: 21, letterSpacing: "-.01em", color: T.ink, marginTop: 16 }}>{t.title}</div>
                    <p style={{ fontSize: 13.5, lineHeight: 1.5, color: T.inkSoft, margin: "6px 0 0", minHeight: 40 }}>{t.blurb}</p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.line}` }}>
                      <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 600, letterSpacing: ".04em", color: T.faint }}>{stat}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: T.mono, fontWeight: 600, fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: t.color }}>{t.cta}<span style={{ display: "grid", placeItems: "center" }}>{ARROW}</span></span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* ── Right rail ── */}
      {!isMobile && (
      <aside style={{ width: 352, flex: "none", background: T.bgDeep, borderLeft: `1px solid ${T.line}`, overflowY: "auto", padding: "24px 22px", display: "flex", flexDirection: "column", gap: 18 }}>
        {(!entLoaded || summit) ? (
          <div style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: 18, padding: 20 }}>
            <span style={{ display: "inline-block", background: T.kube, color: "#fff", fontFamily: T.mono, fontWeight: 600, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 7 }}>{entitlement?.tier ? TIER_LABEL[entitlement.tier] : "Kube Summit"}</span>
            <div style={{ fontFamily: T.display, fontWeight: 600, fontSize: 18, color: T.ink, marginTop: 12 }}>Drilling without limits.</div>
            <p style={{ fontSize: 13, lineHeight: 1.5, color: T.inkSoft, margin: "6px 0 0" }}>Every unit, every tool, and the tutor ready to explain any miss.</p>
          </div>
        ) : (
          <div style={{ background: T.kubeSoft, border: `1px solid ${T.kubeLine}`, borderRadius: 18, padding: 20 }}>
            <span style={{ display: "inline-block", background: T.kube, color: "#fff", fontFamily: T.mono, fontWeight: 600, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 7 }}>Kube Summit</span>
            <div style={{ fontFamily: T.display, fontWeight: 600, fontSize: 19, color: T.ink, marginTop: 13 }}>Drill without limits</div>
            <p style={{ fontSize: 13.5, lineHeight: 1.5, color: T.inkSoft, margin: "7px 0 0" }}>Unlimited sprints, every unit unlocked, and the AI tutor ready to explain any miss the moment you make it.</p>
            <Link href="/learn/upgrade" style={{ display: "block", textAlign: "center", width: "100%", marginTop: 16, background: T.kube, color: "#fff", borderRadius: 13, padding: 13, fontFamily: T.mono, fontWeight: 600, fontSize: 12.5, letterSpacing: ".1em", textTransform: "uppercase", boxShadow: "0 4px 0 rgba(20,32,43,.18)" }}>Unlock with Summit</Link>
          </div>
        )}

        {/* Your gym — real stats */}
        <div style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: 18, padding: 20 }}>
          <span style={{ fontFamily: T.display, fontWeight: 600, fontSize: 17, color: T.ink }}>Your gym</span>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            {[{ v: due, l: "Due now" }, { v: learned, l: "Learned" }, { v: best, l: "Sprint best" }].map((s) => (
              <div key={s.l} style={{ flex: 1, background: T.bgDeep, borderRadius: 13, padding: "12px 10px", textAlign: "center" }}>
                <div style={{ fontFamily: T.display, fontWeight: 600, fontSize: 22, color: T.ink, lineHeight: 1 }}>{s.v}</div>
                <div style={{ fontFamily: T.mono, fontSize: 9.5, letterSpacing: ".1em", textTransform: "uppercase", color: T.faint, marginTop: 5 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Weak spots — real, from SM-2 ease */}
        <div style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: 18, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ flex: "none", display: "grid", placeItems: "center", width: 34, height: 34, borderRadius: 10, background: T.redSoft, color: T.red }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3.5" /></svg>
            </span>
            <div>
              <div style={{ fontFamily: T.display, fontWeight: 600, fontSize: 17, color: T.ink, lineHeight: 1.1 }}>Weak spots</div>
              <div style={{ fontSize: 11.5, color: T.faint }}>Lowest recall so far</div>
            </div>
          </div>
          {weak.length === 0 ? (
            <p style={{ fontSize: 13, color: T.faint, marginTop: 14 }}>Practise a little and your shakiest concepts show up here.</p>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
                {weak.map((w) => (
                  <div key={w.name} style={{ display: "flex", alignItems: "center", gap: 11 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{w.name}</div>
                      <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: ".06em", color: T.faint, marginTop: 1 }}>Unit {w.unit}</div>
                    </div>
                    <div style={{ flex: "none", width: 58, height: 7, borderRadius: 999, background: T.line, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${w.pct}%`, borderRadius: 999, background: w.pct < 50 ? T.red : T.amber }} />
                    </div>
                    <span style={{ flex: "none", width: 34, textAlign: "right", fontFamily: T.mono, fontSize: 11, fontWeight: 600, color: w.pct < 50 ? T.red : T.amber }}>{w.pct}%</span>
                  </div>
                ))}
              </div>
              <button onClick={() => openTool("flashcards")} style={{ width: "100%", marginTop: 16, background: T.card, color: T.red, border: `1.5px solid ${T.red}`, borderRadius: 12, padding: 11, fontFamily: T.mono, fontWeight: 600, fontSize: 11.5, letterSpacing: ".08em", textTransform: "uppercase", cursor: "pointer" }}>Drill these</button>
            </>
          )}
        </div>
      </aside>
      )}

      {isMobile && <MobileTabs courseId={params.courseId} active="Practice" />}
    </div>
  );
}
