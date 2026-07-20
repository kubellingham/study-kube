"use client";

// Notes & glossary — brief §1.5. A calm reference view of every topic's key
// lines, like Duolingo's "Tips" article. No interaction, just the facts.
import Link from "next/link";
import { useParams } from "next/navigation";
import { getCourseBundle } from "@/lib/course";

export default function GlossaryPage() {
  const params = useParams<{ courseId: string }>();
  const bundle = getCourseBundle(params.courseId);

  if (!bundle) {
    return (
      <main className="mx-auto max-w-lg flex-1 px-4 py-16 text-center">
        <p style={{ color: "var(--faint)" }}>That course isn&apos;t in Kube yet.</p>
        <Link href="/learn" className="mt-4 inline-block text-sm font-semibold" style={{ color: "var(--kube)" }}>
          ← your subjects
        </Link>
      </main>
    );
  }

  const { course } = bundle;

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

      {course.sections.map((section) => (
        <section key={section.id} className="mt-10">
          <span className="k-eyebrow">
            Section {section.letter} · Unit {section.unit}
          </span>
          <h2 className="mt-1 text-2xl">{section.title}</h2>
          <div className="mt-4 flex flex-col gap-4">
            {section.topics.map((topic) => (
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
                      <span>{line}</span>
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
