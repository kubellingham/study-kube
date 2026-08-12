"use client";

// Notes & glossary — brief §1.5. A calm reference view of every topic's key
// lines, like Duolingo's "Tips" article. No interaction, just the facts.
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCourse } from "@/lib/learn/use-course";
import { collectVocab } from "@/lib/learn/glossary";
import { useCramLocked, CramLocked } from "@/app/learn/components/PlanGate";
import { RichInline } from "@/app/learn/components/Rich";

export default function GlossaryPage() {
  const params = useParams<{ courseId: string }>();
  const { status, bundle } = useCourse(params.courseId);
  const cramLocked = useCramLocked();

  if (status === "notfound") {
    return (
      <main className="mx-auto max-w-lg flex-1 px-4 py-16 text-center">
        <p style={{ color: "var(--faint)" }}>That course isn&apos;t in Kube yet.</p>
        <Link href="/learn" className="mt-4 inline-block text-sm font-semibold" style={{ color: "var(--kube)" }}>
          ← your subjects
        </Link>
      </main>
    );
  }

  if (!bundle) {
    return (
      <div className="flex-1 grid place-items-center text-sm" style={{ color: "var(--faint)" }}>
        Loading…
      </div>
    );
  }
  if (cramLocked) return <CramLocked feature="Notes" />;

  const { course } = bundle;
  const vocab = collectVocab(course);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-24 pt-10">
      <div className="mb-2 flex items-center justify-between">
        <span className="k-eyebrow">{course.code} · notes &amp; glossary</span>
        <Link href={`/learn/${course.id}`} className="text-xs" style={{ color: "var(--faint)" }}>
          ← path
        </Link>
      </div>
      <h1 className="text-3xl">Everything, on one page</h1>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
        The key lines from every topic on the ladder — for a final calm read-through
        before you walk in.
      </p>

      {/* Vocabulary — every term Kube glossed inside the lessons, in one place. */}
      {vocab.length > 0 && (
        <section className="mt-10">
          <span className="k-eyebrow" style={{ color: "var(--kube)" }}>vocabulary · {vocab.length}</span>
          <h2 className="mt-1 text-2xl">The words, defined</h2>
          <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            Every term Kube stopped to explain, gathered from the lessons.
          </p>
          <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            {vocab.map((v) => (
              <div key={v.term} className="k-card px-4 py-3">
                <dt className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>{v.term}</span>
                  <Link
                    href={`/learn/${course.id}/lesson/${v.topicId}`}
                    className="whitespace-nowrap text-[11px] font-semibold"
                    style={{ color: "var(--kube)" }}
                    title={`Taught in “${v.topicTitle}”`}
                  >
                    lesson →
                  </Link>
                </dt>
                <dd className="mt-1 text-[0.8125rem] leading-relaxed" style={{ color: "var(--ink-soft)" }}><RichInline text={v.def} /></dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {course.sections.map((section) => (
        <section key={section.id} className="mt-10">
          <span className="k-eyebrow">
            Section {section.letter} · Unit {section.unit}
          </span>
          <h2 className="mt-1 text-2xl">{section.title}</h2>
          <div className="mt-4 flex flex-col gap-4">
            {section.topics.filter((t) => t.kind !== "review").map((topic) => (
              <div key={topic.id} className="k-card px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-semibold" style={{ color: "var(--ink)" }}>
                    {topic.title}
                  </h3>
                  <Link
                    href={`/learn/${course.id}/lesson/${topic.id}`}
                    className="whitespace-nowrap text-xs font-semibold"
                    style={{ color: "var(--kube)" }}
                  >
                    open lesson →
                  </Link>
                </div>
                <ul className="mt-3 space-y-2">
                  {topic.recap.map((line, i) => (
                    <li
                      key={i}
                      className="flex gap-2.5 text-sm leading-relaxed"
                      style={{ color: "var(--ink-soft)" }}
                    >
                      <span aria-hidden style={{ color: "var(--kube-line)" }}>
                        ●
                      </span>
                      <span><RichInline text={line} /></span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
