// Renders a teach step's sanitized SVG diagram. The SVG is scrubbed to a safe
// allowlist at ingest time (lib/course/svg.ts) and stroked with `currentColor`,
// so setting the container's color themes the whole drawing. dangerouslySet is
// safe here precisely because the string is sanitized upstream.
export default function Diagram({ svg }: { svg: string }) {
  return (
    <figure
      className="mt-4 flex justify-center rounded-2xl border px-4 py-5"
      style={{
        borderColor: "var(--line)",
        background: "var(--card)",
        color: "var(--kube)", // currentColor for strokes/text in the SVG
      }}
    >
      <div
        className="w-full max-w-md [&_svg]:h-auto [&_svg]:w-full"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </figure>
  );
}
