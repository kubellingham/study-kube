"use client";

// Shared keyboard-shortcut helpers for the learn zone.
//
// `keysBlocked` is the "don't grab keys when the student is typing or a
// dialog is open" sentinel — extracted from the lesson page so exam and
// practice screens can reuse it. `useMcqKeys` binds 1..N digit keys to
// pick the option at that index; it stays quiet while `active` is false
// (e.g. after the answer is revealed) so pressing 3 in a graded question
// doesn't accidentally re-answer it. `OptionKeyChip` renders the digit
// visibly on each option so the mapping is discoverable without a
// shortcut sheet.

import { useEffect } from "react";

/** True when keyboard shortcuts must stay quiet: the student is typing
 *  (chat input), a dialog is open, or a focused button/link already owns
 *  the key natively. */
export function keysBlocked(): boolean {
  if (typeof document === "undefined") return true;
  const el = document.activeElement;
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return true;
  if (
    el instanceof HTMLElement &&
    (el.isContentEditable || el.tagName === "BUTTON" || el.tagName === "A")
  ) {
    return true;
  }
  return !!document.querySelector('[role="dialog"]');
}

/** Bind 1..min(optionCount, 9) to pick the option at that (zero-based)
 *  index. No-ops while `active` is false — pass `false` once the question
 *  is answered/revealed so the digit doesn't fire again. */
export function useMcqKeys(
  optionCount: number,
  onPick: (index: number) => void,
  active: boolean = true,
): void {
  useEffect(() => {
    if (!active || optionCount <= 0) return;
    function onKey(e: KeyboardEvent) {
      if (e.repeat || keysBlocked()) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key.length !== 1 || e.key < "1" || e.key > "9") return;
      const idx = Number(e.key) - 1;
      if (idx >= optionCount) return;
      e.preventDefault();
      onPick(idx);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [optionCount, onPick, active]);
}

/** A subtle mono chip carrying the digit that picks this option. Placed
 *  at the leading edge of an MCQ button so the mapping is visible
 *  without a shortcut sheet. */
export function OptionKeyChip({ index }: { index: number }) {
  return (
    <span
      aria-hidden
      className="k-mcq-key"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: "1.4rem",
        height: "1.4rem",
        padding: "0 0.4rem",
        borderRadius: "0.35rem",
        border: "1px solid var(--line)",
        fontFamily: "var(--font-mono)",
        fontSize: "0.72rem",
        lineHeight: 1,
        color: "var(--faint)",
        background: "transparent",
        flexShrink: 0,
      }}
    >
      {index + 1}
    </span>
  );
}
