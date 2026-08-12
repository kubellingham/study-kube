"use client";

// Kube home — your subjects. Built-in courses you have access to, plus every
// course you've created from your own PDFs. Private per account.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "@/lib/firebase/client";
import { useUser } from "@/lib/use-user";
import { isOwner } from "@/lib/owner";
import { listBuiltinBundles } from "@/lib/course";
import { loadProgress } from "@/lib/learn/progress";
import RedeemCode from "@/app/learn/components/RedeemCode";
import ManageBilling from "@/app/learn/components/ManageBilling";
import { useEntitlement } from "@/lib/use-entitlement";
import {
  loadPlan,
  setCourseSemester,
  setCurrentSemester,
  groupBySemester,
  semesterLabel,
  inferCurrentSemester,
  emptyPlan,
  SEMESTERS,
  type StudyPlan,
} from "@/lib/learn/plan";

interface SubjectCard {
  id: string;
  code: string;
  title: string;
  sections: number;
  topics: number;
  climbed: number;
}

/** "You're in Semester N" + the toggle that lets you file subjects into one. */
function SemesterBar({
  plan,
  suggestion,
  organising,
  onPick,
  onToggleOrganise,
}: {
  plan: StudyPlan;
  suggestion: number | null;
  organising: boolean;
  onPick: (sem: number | null) => void;
  onToggleOrganise: () => void;
}) {
  const [open, setOpen] = useState(false);
  const current = plan.currentSemester;
  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold"
          style={{
            borderColor: current === null ? "var(--line)" : "var(--kube-line)",
            color: current === null ? "var(--ink-soft)" : "var(--kube)",
            background: current === null ? "var(--card)" : "var(--kube-soft)",
          }}
        >
          {current === null ? "Set the semester you're in" : `You're in Semester ${current}`}
          <span aria-hidden style={{ fontSize: 9 }}>{open ? "▲" : "▼"}</span>
        </button>
        <button
          type="button"
          onClick={onToggleOrganise}
          className="rounded-full border px-3.5 py-1.5 text-xs font-semibold"
          style={{
            borderColor: organising ? "var(--kube-line)" : "var(--line)",
            color: organising ? "var(--kube)" : "var(--ink-soft)",
            background: organising ? "var(--kube-soft)" : "var(--card)",
          }}
        >
          {organising ? "Done organising" : "Organise by semester"}
        </button>
      </div>

      {open && (
        <div className="k-card mt-3 px-4 py-4">
          <p className="text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            Pick the semester you&apos;re studying now. Its subjects sit at the top of your
            shelf; everything else stays here, just out of the way.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {SEMESTERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => { onPick(s); setOpen(false); }}
                className="rounded-xl border px-3 py-1.5 text-sm font-semibold"
                style={{
                  borderColor: s === current ? "var(--kube)" : "var(--line)",
                  background: s === current ? "var(--kube-soft)" : "var(--card)",
                  color: s === current ? "var(--kube)" : "var(--ink)",
                  minWidth: 44,
                }}
              >
                {s}
              </button>
            ))}
          </div>
          {current !== null && (
            <button
              type="button"
              onClick={() => { onPick(null); setOpen(false); }}
              className="mt-3 text-xs font-semibold"
              style={{ color: "var(--faint)" }}
            >
              Clear — show every semester the same
            </button>
          )}
          {current === null && suggestion !== null && (
            <button
              type="button"
              onClick={() => { onPick(suggestion); setOpen(false); }}
              className="mt-3 text-xs font-semibold"
              style={{ color: "var(--kube)" }}
            >
              Looks like Semester {suggestion} — use that
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** One semester's shelf: its subjects, and how far through them you are. */
function SemesterGroup({
  semester,
  subjects,
  isCurrent,
  organising,
  onFile,
}: {
  semester: number | null;
  subjects: SubjectCard[];
  isCurrent: boolean;
  organising: boolean;
  onFile: (courseId: string, sem: number | null) => void;
}) {
  // Collapsed by default once you've told us which semester you're in — the
  // point of filing is that last year's subjects stop competing for attention.
  const [open, setOpen] = useState(isCurrent || semester === null);
  const topics = subjects.reduce((n, s) => n + s.topics, 0);
  const climbed = subjects.reduce((n, s) => n + s.climbed, 0);
  const pct = topics > 0 ? (climbed / topics) * 100 : 0;

  return (
    <section>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 py-1 text-left"
      >
        <span className="flex items-center gap-2">
          <span className="k-eyebrow" style={{ color: isCurrent ? "var(--kube)" : undefined }}>
            {semesterLabel(semester)}
          </span>
          {isCurrent && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
              style={{ background: "var(--kube-soft)", color: "var(--kube)" }}
            >
              now
            </span>
          )}
        </span>
        <span className="text-xs" style={{ color: "var(--faint)" }}>
          {subjects.length === 0
            ? "nothing filed here yet"
            : `${subjects.length} subject${subjects.length === 1 ? "" : "s"}`}
          <span aria-hidden className="ml-2" style={{ fontSize: 9 }}>{open ? "▲" : "▼"}</span>
        </span>
      </button>

      {/* The one number that answers "how am I doing this semester". */}
      {isCurrent && topics > 0 && (
        <div className="mb-2 mt-1">
          <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: "var(--line)" }}>
            <div className="k-bar h-full rounded-full" style={{ width: `${pct}%`, background: "var(--kube)" }} />
          </div>
          <p className="mt-1 text-xs" style={{ color: "var(--faint)" }}>
            {climbed} of {topics} topics climbed across this semester
          </p>
        </div>
      )}

      {open && (
        <div className="mt-2 flex flex-col gap-4">
          {subjects.length === 0 ? (
            <p className="text-sm leading-relaxed" style={{ color: "var(--faint)" }}>
              Tap <b>Organise by semester</b> above and file your subjects into it.
            </p>
          ) : (
            subjects.map((c) => (
              <SubjectRow key={c.id} card={c} semester={semester} organising={organising} onFile={onFile} />
            ))
          )}
        </div>
      )}
    </section>
  );
}

/** A subject card — plus, in organise mode, the row of semesters to file it under. */
function SubjectRow({
  card: c,
  semester,
  organising,
  onFile,
}: {
  card: SubjectCard;
  semester: number | null;
  organising: boolean;
  onFile: (courseId: string, sem: number | null) => void;
}) {
  const pct = c.topics > 0 ? (c.climbed / c.topics) * 100 : 0;
  const body = (
    <>
      <span className="k-eyebrow">{c.code}</span>
      <h2 className="mt-1 text-xl">{c.title}</h2>
      <p className="mt-1 text-sm" style={{ color: "var(--ink-soft)" }}>
        {c.topics === 0
          ? "No units digested yet — open to add the first"
          : `${c.sections} sections · ${c.topics} topics · ${
              c.climbed === 0
                ? "not started"
                : c.climbed === c.topics
                  ? "complete"
                  : `${c.climbed} climbed`
            }`}
      </p>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full" style={{ background: "var(--line)" }}>
        <div className="k-bar h-full rounded-full" style={{ width: `${pct}%`, background: "var(--kube)" }} />
      </div>
    </>
  );

  // In organise mode the card stops being a link, so tapping a semester chip
  // can't navigate away mid-file.
  if (!organising) {
    return (
      <Link href={`/learn/${c.id}`} className="k-card block px-6 py-5 transition-transform hover:scale-[1.01]">
        {body}
      </Link>
    );
  }
  return (
    <div className="k-card px-6 py-5">
      {body}
      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <span className="k-eyebrow mr-1">semester</span>
        {SEMESTERS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onFile(c.id, s === semester ? null : s)}
            className="rounded-lg border text-xs font-semibold"
            style={{
              borderColor: s === semester ? "var(--kube)" : "var(--line)",
              background: s === semester ? "var(--kube-soft)" : "var(--card)",
              color: s === semester ? "var(--kube)" : "var(--ink-soft)",
              minWidth: 34,
              minHeight: 34,
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function LearnHomePage() {
  const { user, loading } = useUser();
  const { entitlement } = useEntitlement();
  const inCrew = entitlement?.tier === "crew" || entitlement?.source === "crew";
  const router = useRouter();
  const [subjects, setSubjects] = useState<SubjectCard[] | null>(null);
  const [plan, setPlan] = useState<StudyPlan>(emptyPlan());
  const [organising, setOrganising] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/");
    if (!user) return;
    (async () => {
      const builtin = listBuiltinBundles(user.email);
      let mine: { id: string; code: string; title: string; sections: number; topics: number }[] =
        [];
      try {
        const snap = await getDocs(
          query(collection(db(), "courses"), where("userId", "==", user.uid))
        );
        mine = snap.docs.map((d) => {
          const sections = (d.get("sections") as { topics: unknown[] }[]) ?? [];
          return {
            id: d.id,
            code: d.get("code") as string,
            title: d.get("title") as string,
            sections: sections.length,
            topics: sections.reduce((n, s) => n + s.topics.length, 0),
          };
        });
      } catch {
        // No owned courses (or transient error) — show built-ins regardless.
      }

      const all = [
        ...builtin.map((b) => ({
          id: b.course.id,
          code: b.course.code,
          title: b.course.title,
          sections: b.course.sections.length,
          topics: b.ladder.length,
          topicIds: b.ladder.map((t) => t.id),
        })),
        ...mine.map((m) => ({ ...m, topicIds: null as string[] | null })),
      ];

      const cards = await Promise.all(
        all.map(async (c) => {
          const p = await loadProgress(user.uid, c.id);
          const doneIds = Object.keys(p.completed);
          const climbed = c.topicIds
            ? c.topicIds.filter((t) => p.completed[t]).length
            : doneIds.length;
          return {
            id: c.id,
            code: c.code,
            title: c.title,
            sections: c.sections,
            topics: c.topics,
            climbed: Math.min(climbed, c.topics),
          };
        })
      );
      setSubjects(cards);
      setPlan(await loadPlan(user.uid));
    })();
  }, [user, loading, router]);

  /** Optimistic: the shelf regroups on tap, the write follows. */
  async function fileSubject(courseId: string, semester: number | null) {
    if (!user) return;
    setPlan((p) => {
      const semesters = { ...p.semesters };
      if (semester === null) delete semesters[courseId];
      else semesters[courseId] = semester;
      return { ...p, semesters };
    });
    await setCourseSemester(user.uid, courseId, semester).catch(() => {});
  }

  async function pickCurrent(semester: number | null) {
    if (!user) return;
    setPlan((p) => ({ ...p, currentSemester: semester }));
    await setCurrentSemester(user.uid, semester).catch(() => {});
  }

  if (loading || !user || !subjects) {
    return (
      <div className="flex-1 grid place-items-center text-sm" style={{ color: "var(--faint)" }}>
        Loading your subjects…
      </div>
    );
  }

  const groups = groupBySemester(subjects, plan);

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 pb-24 pt-6">
      <div className="mb-8 flex items-center justify-between">
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: 22,
            letterSpacing: "-.02em",
            lineHeight: 1,
          }}
        >
          <span style={{ color: "var(--ink)" }}>Studying</span>
          <span style={{ color: "var(--kube)" }}>Kube</span>
        </span>
        <div className="flex items-center gap-3">
          {inCrew && (
            <Link href="/learn/crew" className="rounded-full border px-3.5 py-1.5 text-xs font-semibold" style={{ borderColor: "var(--kube-line)", color: "var(--kube)", background: "var(--kube-soft)" }}>
              Crew
            </Link>
          )}
          <ManageBilling />
          <RedeemCode />
          {isOwner(user.email) && (
            <Link
              href="/admin"
              className="rounded-full border px-3.5 py-1.5 text-xs font-semibold"
              style={{ borderColor: "var(--line)", color: "var(--ink-soft)", background: "var(--card)" }}
            >
              Admin
            </Link>
          )}
          {user.email && (
            <span
              className="hidden text-xs sm:inline"
              style={{ color: "var(--faint)", fontFamily: "var(--font-mono)" }}
            >
              {user.email}
            </span>
          )}
          <Link
            href="/learn/account"
            className="rounded-full border px-3.5 py-1.5 text-xs font-semibold"
            style={{ borderColor: "var(--line)", color: "var(--ink-soft)", background: "var(--card)" }}
          >
            Account
          </Link>
          <button
            type="button"
            onClick={async () => {
              await signOut(auth());
              window.location.assign("/");
            }}
            className="flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold"
            style={{ borderColor: "var(--line)", color: "var(--ink-soft)", background: "var(--card)" }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
            Sign out
          </button>
        </div>
      </div>
      {subjects.length === 0 ? (
        <>
          <h1 className="text-3xl">Let&apos;s make your first subject.</h1>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            Name a course, feed it your material, and Kube turns it into one calm
            ladder to climb. You&apos;ll land back here every time — tap a subject to
            open it, or switch subjects from the top of any course.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-3xl">Your subjects</h1>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            One calm ladder per course, private to your account — climb it, or
            practise what&apos;s in it.
          </p>
        </>
      )}

      {/* Which semester am I in — the question the shelf answers. */}
      {subjects.length > 0 && (
        <SemesterBar
          plan={plan}
          suggestion={inferCurrentSemester(plan)}
          organising={organising}
          onPick={pickCurrent}
          onToggleOrganise={() => setOrganising((v) => !v)}
        />
      )}

      <div className="mt-6 flex flex-col gap-4">
        {groups.map((g) => (
          <SemesterGroup
            key={g.semester === null ? "unfiled" : g.semester}
            semester={g.semester}
            subjects={g.items}
            isCurrent={g.semester !== null && g.semester === plan.currentSemester}
            organising={organising}
            onFile={fileSubject}
          />
        ))}

        <Link
          href="/learn/new"
          className="block rounded-2xl border-2 border-dashed px-6 py-6 text-center transition-colors"
          style={{ borderColor: "var(--kube-line)", color: "var(--kube)" }}
        >
          <span className="text-2xl" aria-hidden>
            +
          </span>
          <p className="mt-1 text-sm font-semibold">Add a subject</p>
          <p className="mt-1 text-xs" style={{ color: "var(--faint)" }}>
            Give it a course code, then feed it your unit PDFs — Kube digests
            them into a ladder.
          </p>
        </Link>
      </div>
    </main>
  );
}
