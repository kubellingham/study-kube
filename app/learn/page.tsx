"use client";

// Kube home — the command deck. One calm dashboard that answers, at a glance:
// what to pick up next, what's due, how the week's going, which exam is
// closing in — then your subjects for the semester you're in. Everything above
// the subject grid is a cross-course roll-up built by lib/learn/home.ts from
// the same per-course data the shelf already loads. Private per account.
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "@/lib/firebase/client";
import { authedFetch } from "@/lib/authed-fetch";
import { useUser } from "@/lib/use-user";
import { isOwner } from "@/lib/owner";
import { listBuiltinBundles } from "@/lib/course";
import { loadProgress } from "@/lib/learn/progress";
import { loadPracticeState } from "@/lib/learn/practice";
import { loadRhythm } from "@/lib/learn/rhythm";
import RedeemCode from "@/app/learn/components/RedeemCode";
import ManageBilling from "@/app/learn/components/ManageBilling";
import { useEntitlement } from "@/lib/use-entitlement";
import { TIER_LABEL, type Tier } from "@/lib/entitlement";
import {
  loadPlan,
  setCourseSemester,
  emptyPlan,
  SEMESTERS,
  type StudyPlan,
} from "@/lib/learn/plan";
import {
  buildHomeView,
  examChip,
  relativeLabel,
  greeting,
  dateLabel,
  type HomeCourse,
} from "@/lib/learn/home";

/** A subject enriched with everything both the shelf and the roll-ups need. */
type SubjectCard = HomeCourse;

/** First name for the greeting, from display name or email. */
function firstName(name: string | null | undefined, email: string | null | undefined): string {
  const src = (name || email || "").trim();
  if (!src) return "there";
  const base = src.includes("@") ? src.split("@")[0] : src;
  const first = base.split(/[.\s_]+/)[0];
  return first ? first.charAt(0).toUpperCase() + first.slice(1) : "there";
}

/* ---------------------------------------------------------------- top bar -- */

function StreakCard({ streak }: { streak: number }) {
  const dots = Array.from({ length: 7 }, (_, i) => i < Math.min(streak, 7));
  return (
    <div
      className="k-card lift"
      style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 12px 7px 11px" }}
      title={streak > 0 ? `${streak}-day study streak` : "Study today to start a streak"}
    >
      <span className="flame" style={{ fontSize: 17, filter: "drop-shadow(0 1px 3px rgba(217,138,31,.4))" }}>
        🔥
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <span style={{ font: "700 13px/1 var(--font-body)", color: "var(--ink)" }}>
          {streak > 0 ? `${streak}-day streak` : "No streak yet"}
        </span>
        <span style={{ display: "flex", gap: 3 }}>
          {dots.map((on, i) => (
            <i
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: on ? "var(--kube)" : "var(--line)",
              }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}

function ProfileMenu({
  name,
  email,
  planLabel,
  onSignOut,
}: {
  name: string;
  email: string | null | undefined;
  planLabel: string;
  onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("") || "U";

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="k-card lift"
        style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 10px 5px 6px", cursor: "pointer", background: "var(--card)" }}
      >
        <span
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "linear-gradient(135deg,var(--kube),#2b8480)",
            display: "grid",
            placeItems: "center",
            font: "700 12px var(--font-body)",
            color: "#fff",
            boxShadow: "0 0 0 2px var(--kube-soft)",
          }}
        >
          {initials}
        </span>
        <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.15, textAlign: "left" }} className="hidden sm:flex">
          <span style={{ font: "600 12px var(--font-body)", color: "var(--ink)" }}>{name}</span>
          <span style={{ font: "400 10px var(--font-mono)", color: "var(--faint)" }}>{planLabel}</span>
        </span>
        <span className={`chev ${open ? "open" : ""}`} style={{ fontSize: 9, color: "var(--faint)", padding: "0 2px" }}>
          ▼
        </span>
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 30 }} />
          <div
            className="menu k-card"
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 8px)",
              width: 240,
              padding: 8,
              zIndex: 40,
              boxShadow: "0 24px 48px -20px rgba(15,32,50,.35)",
            }}
          >
            <div style={{ padding: "10px 12px 12px", borderBottom: "1px solid var(--line)", marginBottom: 6 }}>
              <div style={{ font: "600 13px var(--font-body)", color: "var(--ink)" }}>{name}</div>
              {email && (
                <div style={{ font: "400 11px var(--font-mono)", color: "var(--faint)", marginTop: 2, wordBreak: "break-all" }}>
                  {email}
                </div>
              )}
              <span className="k-chip" style={{ marginTop: 8, padding: "3px 9px" }}>
                {planLabel}
              </span>
            </div>
            <Link
              href="/learn/account"
              onClick={() => setOpen(false)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, textDecoration: "none", color: "var(--ink-soft)", font: "600 13px var(--font-body)" }}
            >
              Account &amp; settings
            </Link>
            <div style={{ padding: "6px 10px" }}>
              <RedeemCode />
            </div>
            <div style={{ padding: "0 10px 6px" }}>
              <ManageBilling />
            </div>
            <div style={{ height: 1, background: "var(--line)", margin: "6px 8px" }} />
            <button
              type="button"
              onClick={onSignOut}
              style={{ display: "flex", width: "100%", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, background: "none", border: "none", cursor: "pointer", color: "var(--red)", font: "600 13px var(--font-body)" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- subjects -- */

function SubjectGridCard({
  card: c,
  now,
  organising,
  filedSemester,
  onFile,
  onOpen,
  onPractice,
}: {
  card: SubjectCard;
  now: number;
  organising: boolean;
  filedSemester: number | null;
  onFile: (courseId: string, sem: number | null) => void;
  onOpen: () => void;
  onPractice: () => void;
}) {
  const pct = c.topics > 0 ? Math.round((c.climbed / c.topics) * 100) : 0;
  const chip = examChip(c.examAt, c.climbed, c.topics, now);
  const complete = c.topics > 0 && c.climbed >= c.topics;
  const fresh = c.climbed === 0;
  const cta = complete ? "Review" : fresh ? "Start" : "Resume";
  const meta =
    c.topics === 0
      ? "no units yet"
      : complete
        ? `${c.topics} / ${c.topics} topics`
        : fresh
          ? `${c.topics} topics · not started`
          : `${c.climbed} / ${c.topics} climbed`;

  return (
    <div
      className="subj k-card"
      style={{ padding: "16px 18px", minWidth: 0 }}
      role="link"
      tabIndex={0}
      onClick={organising ? undefined : onOpen}
      onKeyDown={(e) => {
        if (!organising && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span className="k-eyebrow">{c.code}</span>
        <span style={{ display: "flex", gap: 6 }}>
          {c.crew && (
            <span className="k-chip tl" style={{ padding: "3px 9px" }} title="Shared with your crew">
              Crew
            </span>
          )}
          {chip && (
            <span className={`k-chip ${chip.tone}`} style={{ padding: "3px 9px" }}>
              {chip.label}
            </span>
          )}
        </span>
      </div>
      <h3 style={{ fontSize: 19, lineHeight: 1.15, marginTop: 6 }}>{c.title}</h3>
      <div className="track" style={{ marginTop: 12 }}>
        <div className="fillbar" style={{ width: `${pct}%` }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7, font: "500 11px var(--font-body)", color: "var(--faint)" }}>
        <span>{meta}</span>
        <span>{relativeLabel(c.lastActivityTs, now)}</span>
      </div>

      {organising ? (
        <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
          <span className="k-eyebrow" style={{ marginRight: 2 }}>semester</span>
          {SEMESTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFile(c.id, s === filedSemester ? null : s);
              }}
              className="rounded-lg border text-xs font-semibold"
              style={{
                borderColor: s === filedSemester ? "var(--kube)" : "var(--line)",
                background: s === filedSemester ? "var(--kube-soft)" : "var(--card)",
                color: s === filedSemester ? "var(--kube)" : "var(--ink-soft)",
                minWidth: 32,
                minHeight: 32,
              }}
            >
              {s}
            </button>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button
            type="button"
            className={`k-btn ${complete ? "gho" : "pri"}`}
            style={{ flex: 1 }}
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
          >
            {cta}
          </button>
          {c.topics > 0 && (
            <button
              type="button"
              className="k-btn gho"
              onClick={(e) => {
                e.stopPropagation();
                onPractice();
              }}
            >
              Practice
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ page --- */

export default function LearnHomePage() {
  const { user, loading } = useUser();
  const { entitlement } = useEntitlement();
  const inCrew = entitlement?.tier === "crew" || entitlement?.source === "crew";
  const router = useRouter();
  const [now] = useState(() => Date.now());

  const [subjects, setSubjects] = useState<SubjectCard[] | null>(null);
  const [plan, setPlan] = useState<StudyPlan>(emptyPlan());
  const [streak, setStreak] = useState(0);
  const [organising, setOrganising] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  // null = follow the plan's current semester; otherwise an explicit pick.
  const [selPick, setSelPick] = useState<number | "all" | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/");
    if (!user) return;
    (async () => {
      const builtin = listBuiltinBundles(user.email);
      type Fetched = { id: string; code: string; title: string; sections: number; topics: number; topicIds: string[] | null; crew: boolean };
      let mine: Fetched[] = [];
      let shared: Fetched[] = [];
      try {
        const snap = await getDocs(query(collection(db(), "courses"), where("userId", "==", user.uid)));
        mine = snap.docs.map((d) => {
          const sections = (d.get("sections") as { topics: unknown[] }[]) ?? [];
          return {
            id: d.id,
            code: d.get("code") as string,
            title: d.get("title") as string,
            sections: sections.length,
            topics: sections.reduce((n, s) => n + s.topics.length, 0),
            topicIds: null,
            crew: false,
          };
        });
      } catch {
        /* no owned courses — built-ins still show */
      }

      try {
        const crewRes = await authedFetch("/api/crew");
        if (crewRes.ok) {
          const crewJson = (await crewRes.json()) as {
            leader: { leaderUid: string } | null;
            member: { leaderUid: string } | null;
          };
          const leaderUid = crewJson.leader?.leaderUid ?? crewJson.member?.leaderUid ?? null;
          if (leaderUid) {
            const shSnap = await getDocs(query(collection(db(), "courses"), where("crewId", "==", leaderUid)));
            shared = shSnap.docs
              .filter((d) => d.get("userId") !== user.uid)
              .map((d) => {
                const sections = (d.get("sections") as { topics: unknown[] }[]) ?? [];
                return {
                  id: d.id,
                  code: d.get("code") as string,
                  title: d.get("title") as string,
                  sections: sections.length,
                  topics: sections.reduce((n, s) => n + s.topics.length, 0),
                  topicIds: null,
                  crew: true,
                };
              });
          }
        }
      } catch {
        /* silent — no crew shelf */
      }

      const [studyPlan, rhythm] = await Promise.all([loadPlan(user.uid), loadRhythm(user.uid, now)]);

      const all: Fetched[] = [
        ...builtin.map((b) => ({
          id: b.course.id,
          code: b.course.code,
          title: b.course.title,
          sections: b.course.sections.length,
          topics: b.ladder.length,
          topicIds: b.ladder.map((t) => t.id),
          crew: false,
        })),
        ...mine,
        ...shared,
      ];

      const cards: SubjectCard[] = await Promise.all(
        all.map(async (c) => {
          const [p, practice] = await Promise.all([
            loadProgress(user.uid, c.id),
            loadPracticeState(user.uid, c.id),
          ]);
          const completedIds = c.topicIds
            ? c.topicIds.filter((t) => p.completed[t])
            : Object.keys(p.completed);
          const climbed = Math.min(completedIds.length, c.topics);
          const stamps = Object.values(p.completedAt);
          const lastActivityTs = stamps.length ? Math.max(...stamps) : null;
          const dueReviews = Object.values(practice.cards).filter((cs) => (cs.dueAt ?? 0) <= now).length;
          return {
            id: c.id,
            code: c.code,
            title: c.title,
            sections: c.sections,
            topics: c.topics,
            climbed,
            crew: c.crew,
            semester: studyPlan.semesters[c.id] ?? null,
            examAt: studyPlan.examDates[c.id] ?? null,
            completedAt: p.completedAt,
            completedIds,
            dueReviews,
            lastActivityTs,
          };
        })
      );

      setSubjects(cards);
      setPlan(studyPlan);
      setStreak(rhythm.streak);
    })();
  }, [user, loading, router, now]);

  async function fileSubject(courseId: string, semester: number | null) {
    if (!user) return;
    setPlan((p) => {
      const semesters = { ...p.semesters };
      if (semester === null) delete semesters[courseId];
      else semesters[courseId] = semester;
      return { ...p, semesters };
    });
    setSubjects((subs) => subs && subs.map((s) => (s.id === courseId ? { ...s, semester } : s)));
    await setCourseSemester(user.uid, courseId, semester).catch(() => {});
  }

  const selected: number | "all" = selPick ?? plan.currentSemester ?? "all";

  // Which subjects belong to the selected view.
  const activeCourses = useMemo(() => {
    if (!subjects) return [];
    if (selected === "all") return subjects;
    return subjects.filter((s) => (plan.semesters[s.id] ?? null) === selected);
  }, [subjects, selected, plan.semesters]);

  const view = useMemo(() => buildHomeView(activeCourses, now), [activeCourses, now]);

  // Semester chips: current first, then the rest descending, then "All N".
  const semesterChips = useMemo(() => {
    if (!subjects) return [];
    const present = new Set<number>();
    for (const s of subjects) {
      const sem = plan.semesters[s.id];
      if (typeof sem === "number") present.add(sem);
    }
    if (plan.currentSemester) present.add(plan.currentSemester);
    const rest = [...present].filter((s) => s !== plan.currentSemester).sort((a, b) => b - a);
    const ordered = plan.currentSemester ? [plan.currentSemester, ...rest] : rest;
    return ordered;
  }, [subjects, plan.semesters, plan.currentSemester]);

  if (loading || !user || !subjects) {
    return (
      <div className="flex-1 grid place-items-center text-sm" style={{ color: "var(--faint)" }}>
        Loading your subjects…
      </div>
    );
  }

  const name = firstName(user.displayName, user.email);
  const planLabel = entitlement?.tier ? `${TIER_LABEL[entitlement.tier as Tier]} plan` : "Free plan";
  const empty = subjects.length === 0;

  const activeClimbed = activeCourses.reduce((n, s) => n + s.climbed, 0);
  const activeTopics = activeCourses.reduce((n, s) => n + s.topics, 0);
  const activePct = activeTopics > 0 ? Math.round((activeClimbed / activeTopics) * 100) : 0;

  const goalLeft = Math.max(0, view.goal.target - view.goal.doneToday);
  const pipCount = Math.min(12, Math.max(view.goal.target, view.goal.doneToday, 1));
  const perDayGoal = Math.max(1, Math.ceil(view.week.goal / 7));
  const barMax = Math.max(perDayGoal, ...view.week.days, 1);
  const goalLineTop = Math.max(0, Math.round((1 - perDayGoal / barMax) * 100));
  const todayIdx = (new Date(now).getDay() + 6) % 7;
  const weekAhead = view.week.total - view.week.lastWeekTotal;
  const daysStudiedThisWeek = view.week.days.filter((d) => d > 0).length;

  function onSignOut() {
    signOut(auth()).finally(() => window.location.assign("/"));
  }

  // The daily-goal drawer: the specific topics still open across the view.
  const goalItems = activeCourses
    .filter((c) => c.topics > 0 && c.climbed < c.topics)
    .slice(0, 8)
    .map((c) => ({
      code: c.code,
      title: c.title,
      done: false,
    }));

  return (
    <main className="mx-auto w-full flex-1 px-4 pb-16 pt-5 sm:px-6 lg:px-10" style={{ maxWidth: 1400 }}>
      {/* ===== top bar ===== */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 18 }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 23, letterSpacing: "-.02em", lineHeight: 1 }}>
          <span style={{ color: "var(--ink)" }}>Studying</span>
          <span style={{ color: "var(--kube)" }}>Kube</span>
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {inCrew && (
            <Link
              href="/learn/crew"
              className="k-card lift hidden sm:flex"
              style={{ alignItems: "center", gap: 8, padding: "8px 13px", textDecoration: "none", color: "var(--kube)", font: "600 12px var(--font-body)" }}
            >
              Crew
            </Link>
          )}
          {isOwner(user.email) && (
            <Link
              href="/admin"
              className="k-card lift hidden sm:flex"
              style={{ alignItems: "center", padding: "8px 13px", textDecoration: "none", color: "var(--ink-soft)", font: "600 12px var(--font-body)" }}
            >
              Admin
            </Link>
          )}
          <StreakCard streak={streak} />
          <ProfileMenu name={name} email={user.email} planLabel={planLabel} onSignOut={onSignOut} />
        </div>
      </div>

      {empty ? (
        <EmptyDeck name={name} now={now} />
      ) : (
        <>
          {/* ===== greeting ===== */}
          <div>
            <h1 style={{ fontSize: 30, lineHeight: 1.1 }}>
              {greeting(now)}, {name}.
            </h1>
            <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--ink-soft)" }}>
              {dateLabel(now)}
              {view.todayCount > 0 ? (
                <>
                  {" · "}
                  <b style={{ color: "var(--ink)" }}>
                    {view.todayCount} thing{view.todayCount === 1 ? "" : "s"}
                  </b>{" "}
                  worth moving today
                  {view.soonestExam && view.soonestExam.daysLeft <= 10 ? ", and an exam closing in." : "."}
                </>
              ) : (
                " · a calm day — climb a little, keep it warm."
              )}
            </p>
          </div>

          {/* ===== today band ===== */}
          <div className="today-band mt-4 grid gap-4">
                {/* resume */}
                {view.resume ? (
                  <div
                    className="k-card lift"
                    role="link"
                    tabIndex={0}
                    onClick={() => router.push(`/learn/${view.resume!.courseId}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") router.push(`/learn/${view.resume!.courseId}`);
                    }}
                    style={{
                      minWidth: 0,
                      padding: "16px 20px",
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      flexWrap: "wrap",
                      background: "linear-gradient(115deg,var(--kube-soft),var(--card) 62%)",
                      borderColor: "var(--kube-line)",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ width: 52, height: 52, flex: "none", borderRadius: 12, background: "var(--card)", border: "1px solid var(--kube-line)", display: "grid", placeItems: "center", fontSize: 22 }}>
                      🌳
                    </div>
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <span className="k-eyebrow" style={{ color: "var(--kube)" }}>
                        {view.resume.fresh ? "Ready to start" : "Suggested next · pick up here"}
                      </span>
                      <h2 style={{ fontSize: 21, lineHeight: 1.15, marginTop: 3 }}>{view.resume.title}</h2>
                      <p style={{ margin: "2px 0 0", font: "500 12px var(--font-mono)", color: "var(--faint)" }}>
                        {view.resume.meta}
                        {view.resume.lastLabel !== "not started" ? ` · ${view.resume.lastLabel}` : ""}
                      </p>
                    </div>
                    <span className="k-btn pri" style={{ padding: "10px 18px" }}>
                      {view.resume.fresh ? "Start ▸" : "Resume ▸"}
                    </span>
                  </div>
                ) : (
                  <div className="k-card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 52, height: 52, flex: "none", borderRadius: 12, background: "var(--kube-soft)", border: "1px solid var(--kube-line)", display: "grid", placeItems: "center", fontSize: 22 }}>
                      ✓
                    </div>
                    <div>
                      <span className="k-eyebrow" style={{ color: "var(--kube)" }}>All climbed</span>
                      <h2 style={{ fontSize: 20, lineHeight: 1.15, marginTop: 3 }}>Nothing waiting to start.</h2>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--faint)" }}>Keep it warm with a few reviews.</p>
                    </div>
                  </div>
                )}

                {/* soonest exam */}
                {view.soonestExam ? (
                  <div
                    className="k-card lift"
                    role="link"
                    tabIndex={0}
                    onClick={() => router.push(`/learn/${view.soonestExam!.courseId}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") router.push(`/learn/${view.soonestExam!.courseId}`);
                    }}
                    style={{
                      minWidth: 0,
                      padding: "18px 20px",
                      background: "var(--red-soft)",
                      borderColor: "var(--red-line)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      gap: 5,
                      cursor: "pointer",
                    }}
                  >
                    <span className="k-eyebrow" style={{ color: "var(--red)" }}>Soonest exam</span>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 42, lineHeight: 1, color: "var(--red)" }}>
                        {view.soonestExam.daysLeft}
                      </span>
                      <span style={{ font: "600 13px var(--font-body)", color: "var(--red)" }}>
                        day{view.soonestExam.daysLeft === 1 ? "" : "s"} left
                      </span>
                    </div>
                    <p style={{ margin: 0, font: "500 12px var(--font-body)", color: "var(--red)", opacity: 0.85 }}>
                      {view.soonestExam.code} · {view.soonestExam.title}
                    </p>
                  </div>
                ) : (
                  <div className="k-card" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 5 }}>
                    <span className="k-eyebrow">Exams</span>
                    <p style={{ margin: 0, fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.4 }}>
                      No exam date set. Add one on a subject and Kube plans your run-up.
                    </p>
                  </div>
                )}
          </div>

          {/* ===== stat strip ===== */}
          <div className="mt-3.5 grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
            {/* today's goal */}
            <button
              type="button"
              onClick={() => setGoalOpen((v) => !v)}
              className="k-card lift"
              style={{ textAlign: "left", cursor: "pointer", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 11, background: "var(--card)" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="k-eyebrow">Today&apos;s goal</span>
                <span style={{ font: "600 12px var(--font-body)", color: "var(--kube)" }}>
                  {view.goal.doneToday} / {view.goal.target} topics
                </span>
              </div>
              <div className="pips">
                {Array.from({ length: pipCount }, (_, i) => (
                  <span key={i} className={`pip ${i < view.goal.doneToday ? "on" : ""}`} />
                ))}
              </div>
              <span style={{ font: "500 12px var(--font-body)", color: "var(--faint)", display: "flex", alignItems: "center", gap: 5 }}>
                {goalLeft > 0 ? `${goalLeft} to go — ` : "Goal met — "}
                <span style={{ color: "var(--kube)" }}>{goalOpen ? "hide today's plan" : "see today's plan"}</span>
                <span className={`chev ${goalOpen ? "open" : ""}`} style={{ fontSize: 8 }}>▼</span>
              </span>
            </button>

            {/* this week */}
            <div className="k-card lift" style={{ padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="k-eyebrow">This week</span>
                <span style={{ font: "600 12px var(--font-body)", color: "var(--kube)" }}>
                  {view.week.total} / {view.week.goal} topics
                </span>
              </div>
              <div style={{ position: "relative", height: 46, marginTop: 12, display: "flex", alignItems: "flex-end", gap: 8 }}>
                <div style={{ position: "absolute", left: 0, right: 0, top: goalLineTop, borderTop: "1.5px dashed var(--kube-line)" }} />
                <span style={{ position: "absolute", right: 0, top: Math.max(-4, goalLineTop - 10), font: "500 9px var(--font-mono)", color: "var(--kube)", background: "var(--card)", padding: "0 3px" }}>
                  goal
                </span>
                {view.week.days.map((d, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: `${Math.max(6, Math.round((d / barMax) * 100))}%`,
                      borderRadius: 4,
                      background: i === todayIdx ? "var(--kube)" : d > 0 ? "var(--kube)" : "var(--line)",
                      opacity: i === todayIdx ? 1 : d > 0 ? 0.82 : 1,
                    }}
                  />
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, font: "500 9.5px var(--font-mono)", color: "var(--faint)" }}>
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <span key={i} style={{ color: i === todayIdx ? "var(--kube)" : undefined }}>{d}</span>
                ))}
              </div>
              <p style={{ margin: "9px 0 0", font: "500 12px var(--font-body)", color: "var(--faint)" }}>
                {daysStudiedThisWeek}-day pace
                {weekAhead !== 0 && (
                  <>
                    {" · "}
                    <span style={{ color: weekAhead > 0 ? "var(--kube)" : "var(--amber)" }}>
                      {weekAhead > 0 ? `▲ ${weekAhead} ahead` : `▼ ${Math.abs(weekAhead)} behind`}
                    </span>{" "}
                    of last week
                  </>
                )}
              </p>
            </div>

            {/* reviews due */}
            <div className="k-card lift" style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 11 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="k-eyebrow">Reviews due today</span>
                <span style={{ display: "grid", placeItems: "center", minWidth: 22, height: 22, padding: "0 6px", borderRadius: 999, background: "var(--amber-soft)", border: "1px solid var(--amber-line)", color: "var(--amber)", font: "700 11px var(--font-body)" }}>
                  {view.reviews.total}
                </span>
              </div>
              {view.reviews.total > 0 ? (
                <>
                  <p style={{ margin: 0, font: "500 13px var(--font-body)", color: "var(--ink-soft)", lineHeight: 1.45 }}>
                    {view.reviews.total} flashcard{view.reviews.total === 1 ? "" : "s"} ripe for recall across{" "}
                    <b style={{ color: "var(--ink)" }}>
                      {view.reviews.subjects} subject{view.reviews.subjects === 1 ? "" : "s"}
                    </b>
                    .
                  </p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {view.reviews.perCourse.slice(0, 3).map((r) => (
                      <span key={r.code} className="k-chip" style={{ padding: "3px 9px" }}>
                        {r.code} · {r.count}
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="k-btn pri"
                    style={{ marginTop: 2, alignSelf: "flex-start", padding: "8px 16px" }}
                    onClick={() => {
                      const top = [...activeCourses].filter((c) => c.dueReviews > 0).sort((a, b) => b.dueReviews - a.dueReviews)[0];
                      if (top) router.push(`/learn/${top.id}/practice`);
                    }}
                  >
                    Review now ▸
                  </button>
                </>
              ) : (
                <p style={{ margin: 0, font: "500 13px var(--font-body)", color: "var(--ink-soft)", lineHeight: 1.45 }}>
                  Nothing ripe yet — climb a lesson and its cards will schedule themselves.
                </p>
              )}
            </div>
          </div>

          {/* daily-goal drawer */}
          {goalOpen && (
            <div className="drawer k-card" style={{ marginTop: 14, padding: "18px 20px", background: "var(--bg-deep)", borderColor: "var(--kube-line)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <h3 style={{ fontSize: 18 }}>Today&apos;s plan — {view.goal.target} topic{view.goal.target === 1 ? "" : "s"}</h3>
                <span className="k-chip tl" style={{ padding: "3px 10px" }}>
                  {view.goal.doneToday} done · {goalLeft} left
                </span>
              </div>
              {goalItems.length > 0 ? (
                <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))" }}>
                  {goalItems.map((g, i) => (
                    <div key={i} className="k-card" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--card)" }}>
                      <span style={{ width: 20, height: 20, flex: "none", borderRadius: "50%", display: "grid", placeItems: "center", border: "2px solid var(--line)", background: "transparent", color: "#fff", fontSize: 11, fontWeight: 700 }} />
                      <span style={{ minWidth: 0 }}>
                        <span style={{ display: "block", font: "600 13px var(--font-body)", color: "var(--ink)", lineHeight: 1.2 }}>{g.title}</span>
                        <span style={{ display: "block", font: "500 10px var(--font-mono)", color: "var(--faint)", marginTop: 2 }}>{g.code}</span>
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: 13, color: "var(--faint)" }}>Nothing left open in this view — you&apos;re clear.</p>
              )}
              <p style={{ margin: "12px 0 0", font: "500 12px var(--font-body)", color: "var(--faint)" }}>
                Kube builds this from your exam dates and what&apos;s fading — finish it to keep the streak.
              </p>
            </div>
          )}

          {/* ===== subjects ===== */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", margin: "22px 0 4px" }}>
            <h2 style={{ fontSize: 23 }}>Your subjects</h2>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", alignItems: "center" }}>
              {semesterChips.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelPick(s)}
                  className={`k-chip ${selected === s ? "tl" : ""}`}
                  style={{ cursor: "pointer" }}
                >
                  Semester {s}
                  {s === plan.currentSemester ? " · now" : ""}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSelPick("all")}
                className={`k-chip ${selected === "all" ? "tl" : ""}`}
                style={{ cursor: "pointer" }}
              >
                All {subjects.length}
              </button>
              <button
                type="button"
                onClick={() => setOrganising((v) => !v)}
                className="k-chip"
                style={{ cursor: "pointer", color: organising ? "var(--kube)" : undefined, borderColor: organising ? "var(--kube-line)" : undefined, background: organising ? "var(--kube-soft)" : undefined }}
              >
                {organising ? "Done" : "Organise"}
              </button>
            </div>
          </div>

          {/* current-view progress line */}
          {activeTopics > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "14px 0 12px" }}>
              <span className="k-eyebrow" style={{ color: "var(--kube)" }}>
                {selected === "all" ? "All subjects" : `Semester ${selected}${selected === plan.currentSemester ? " — now" : ""}`}
              </span>
              <div className="track" style={{ width: 120 }}>
                <div className="fillbar" style={{ width: `${activePct}%` }} />
              </div>
              <span style={{ font: "500 12px var(--font-body)", color: "var(--faint)" }}>
                {activeClimbed} / {activeTopics} climbed
              </span>
              <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
            </div>
          )}

          <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))" }}>
            {activeCourses.map((c) => (
              <SubjectGridCard
                key={c.id}
                card={c}
                now={now}
                organising={organising}
                filedSemester={plan.semesters[c.id] ?? null}
                onFile={fileSubject}
                onOpen={() => router.push(`/learn/${c.id}`)}
                onPractice={() => router.push(`/learn/${c.id}/practice`)}
              />
            ))}

            {activeCourses.length === 0 && (
              <div className="k-card" style={{ padding: "18px 20px", gridColumn: "1 / -1", color: "var(--ink-soft)", fontSize: 14 }}>
                No subjects filed under this semester yet. Tap <b>Organise</b> to file them, or{" "}
                <button type="button" onClick={() => setSelPick("all")} style={{ background: "none", border: "none", padding: 0, color: "var(--kube)", cursor: "pointer", font: "inherit", fontWeight: 600 }}>
                  view all {subjects.length}
                </button>
                .
              </div>
            )}

            {/* add / view-all tile */}
            <div className="k-card" style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 14, padding: "16px 18px", minWidth: 0, borderStyle: "dashed", borderColor: "var(--kube-line)", background: "var(--bg-deep)" }}>
              <Link href="/learn/new" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
                <span style={{ width: 40, height: 40, flex: "none", borderRadius: 12, background: "var(--kube-soft)", border: "1px solid var(--kube-line)", display: "grid", placeItems: "center", fontSize: 22, color: "var(--kube)", lineHeight: 1 }}>
                  +
                </span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", font: "600 14px var(--font-body)", color: "var(--kube)" }}>Add a subject</span>
                  <span style={{ display: "block", font: "500 11px var(--font-body)", color: "var(--faint)" }}>Feed it your unit PDFs</span>
                </span>
              </Link>
              {selected !== "all" && subjects.length > activeCourses.length && (
                <>
                  <div style={{ height: 1, background: "var(--line)" }} />
                  <button
                    type="button"
                    onClick={() => setSelPick("all")}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, textDecoration: "none", background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left" }}
                  >
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: "block", font: "600 14px var(--font-body)", color: "var(--ink)" }}>View all {subjects.length}</span>
                      <span style={{ display: "block", font: "500 11px var(--font-body)", color: "var(--faint)" }}>
                        {subjects.length - activeCourses.length} more in other semesters
                      </span>
                    </span>
                    <span style={{ color: "var(--kube)", fontSize: 15 }}>▸</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* The today band goes two-up on wider screens; stacks on phones. */}
      <style>{`
        .today-band { grid-template-columns: minmax(0,1fr); }
        @media (min-width: 720px) { .today-band { grid-template-columns: minmax(0,2.1fr) minmax(0,1fr); } }
      `}</style>
    </main>
  );
}

/* --------------------------------------------------------------- empty --- */

function EmptyDeck({ name, now }: { name: string; now: number }) {
  return (
    <>
      <div>
        <h1 style={{ fontSize: 30, lineHeight: 1.1 }}>
          {greeting(now)}, {name}.
        </h1>
        <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--ink-soft)" }}>
          {dateLabel(now)} · let&apos;s make your first subject.
        </p>
      </div>
      <div className="mt-6 grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
        {[
          { n: 1, title: "Name your course", body: "A code like CSE46D and a title — that's your shelf label." },
          { n: 2, title: "Feed it your material", body: "Unit PDFs, lecture decks, your notes, past papers. Kube reads it all." },
          { n: 3, title: "Climb the ladder", body: "Concepts, lessons, practice, and mock exams — in one calm order." },
        ].map((s) => (
          <div key={s.n} className="k-card" style={{ padding: "18px 20px" }}>
            <span
              style={{ display: "grid", placeItems: "center", width: 26, height: 26, borderRadius: 999, background: "var(--kube-soft)", color: "var(--kube)", font: "700 12px var(--font-body)" }}
            >
              {s.n}
            </span>
            <p style={{ marginTop: 10, font: "600 14px var(--font-body)", color: "var(--ink)" }}>{s.title}</p>
            <p style={{ marginTop: 4, fontSize: 12, lineHeight: 1.6, color: "var(--ink-soft)" }}>{s.body}</p>
          </div>
        ))}
      </div>
      <Link
        href="/learn/new"
        className="mt-6 block rounded-2xl border-2 border-dashed px-6 py-6 text-center"
        style={{ borderColor: "var(--kube-line)", color: "var(--kube)" }}
      >
        <span style={{ fontSize: 24 }} aria-hidden>+</span>
        <p style={{ marginTop: 4, font: "600 14px var(--font-body)" }}>Add your first subject</p>
        <p style={{ marginTop: 4, fontSize: 12, color: "var(--faint)" }}>Give it a course code, then feed it your unit PDFs.</p>
      </Link>
    </>
  );
}
