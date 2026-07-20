// Tiny renderer for teach-step markup: paragraphs (blank line), **bold**,
// `code` spans. Deliberately minimal — course content is trusted static data.
import { Fragment } from "react";

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold" style={{ color: "var(--ink)" }}>
          {part.slice(2, -2)}
        </strong>
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
