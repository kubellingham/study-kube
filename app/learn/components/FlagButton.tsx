"use client";

// The honesty flag — outline when off, filled solid (ink) when on. Tapping
// tells Kube "come back and explain this," regardless of right/wrong. Uses
// var(--ink) so it reads near-black in light moods and near-cream in dark.
export default function FlagButton({
  on,
  onToggle,
  size = 18,
}: {
  on: boolean;
  onToggle: () => void;
  size?: number;
}) {
  return (
    <button
      type="button"
      aria-label={on ? "Flagged for Kube to revisit — tap to unflag" : "Flag this for Kube to revisit"}
      aria-pressed={on}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className="grid shrink-0 place-items-center rounded-lg p-1.5 transition-transform active:scale-90"
      title={on ? "Flagged — Kube will come back to this" : "Don't really get it? Flag it for Kube"}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill={on ? "var(--ink)" : "none"} stroke="var(--ink)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M5 21V4h12l-2.5 4L17 12H5" />
      </svg>
    </button>
  );
}
