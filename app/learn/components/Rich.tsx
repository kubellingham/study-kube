// Tiny renderer for teach-step markup: paragraphs (blank line), **bold**,
// *italic*, `code` spans, and [[term|definition]] glossary terms (dotted
// underline that pops a definition on hover/tap). Deliberately minimal — course
// content is trusted static data, except SVG diagrams which are sanitized.
import { Fragment } from "react";
import GlossTerm from "@/app/learn/components/GlossTerm";

function renderInline(text: string): React.ReactNode[] {
  // Glossary terms first (they may contain spaces), then bold before italic so
  // ** is never read as two lone asterisks.
  const parts = text.split(/(\[\[[^\]]+\]\]|\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("[[") && part.endsWith("]]")) {
      const inner = part.slice(2, -2);
      const bar = inner.indexOf("|");
      const term = (bar >= 0 ? inner.slice(0, bar) : inner).trim();
      const def = (bar >= 0 ? inner.slice(bar + 1) : "").trim();
      if (term && def) return <GlossTerm key={i} term={term} def={def} />;
      return <Fragment key={i}>{term}</Fragment>;
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold" style={{ color: "var(--ink)" }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={i} style={{ color: "var(--ink)" }}>
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={i}>{part.slice(1, -1)}</code>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export default function Rich({ body }: { body: string }) {
  return (
    <div className="space-y-3">
      {body.split("\n\n").map((para, i) => (
        <p
          key={i}
          className="text-[0.9375rem] leading-relaxed"
          style={{ color: "var(--ink-soft)" }}
        >
          {para.split("\n").map((line, j, arr) => (
            <Fragment key={j}>
              {renderInline(line)}
              {j < arr.length - 1 && <br />}
            </Fragment>
          ))}
        </p>
      ))}
    </div>
  );
}
