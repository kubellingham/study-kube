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

interface SubjectCard {
  id: string;
  code: string;
  title: string;
  sections: number;
  topics: number;
  climbed: number;
}

export default function LearnHomePage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [subjects, setSubjects] = useState<SubjectCard[] | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
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
    })();
  }, [user, loading, router]);

  if (loading || !user || !subjects) {
    return (
      <div className="flex-1 grid place-items-center text-sm" style={{ color: "var(--faint)" }}>
        Loading your subjects…
      </div>
    );
  }

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
          <button
            type="button"
            onClick={async () => {
              await signOut(auth());
              window.location.assign("/login");
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
      <h1 className="text-3xl">Your subjects</h1>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
        One calm ladder per course, private to your account — climb it, or
        practise what&apos;s in it.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        {subjects.map((c) => {
          const pct = c.topics > 0 ? (c.climbed / c.topics) * 100 : 0;
          return (
            <Link
              key={c.id}
              href={`/learn/${c.id}`}
              className="k-card block px-6 py-5 transition-transform hover:scale-[1.01]"
            >
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
                <div
                  className="k-bar h-full rounded-full"
                  style={{ width: `${pct}%`, background: "var(--kube)" }}
                />
              </div>
            </Link>
          );
        })}

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
