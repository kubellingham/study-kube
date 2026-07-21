"use client";

// Keeps long-lived tabs (especially on phones) from serving a stale build:
// whenever the tab regains focus — and on a slow interval — it compares the
// bundled APP_VERSION against the server's. On mismatch, a calm banner
// offers a one-tap refresh.
import { useEffect, useState } from "react";
import { APP_VERSION } from "@/lib/version";

const CHECK_MS = 10 * 60 * 1000;

export default function UpdateWatcher() {
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const res = await fetch("/api/version", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { version?: string };
        if (
          !cancelled &&
          data.version &&
          data.version !== "dev" &&
          APP_VERSION !== "dev" &&
          data.version !== APP_VERSION
        ) {
          setUpdateReady(true);
        }
      } catch {
        // Offline or transient failure — never bother the user about it.
      }
    }

    check();
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onVisible);
    const interval = setInterval(check, CHECK_MS);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      clearInterval(interval);
    };
  }, []);

  if (!updateReady) return null;

  return (
    <button
      onClick={() => window.location.reload()}
      className="fixed inset-x-0 bottom-0 z-50 px-4 py-3 text-center text-sm font-semibold text-white"
      style={{ background: "#1f6f6b" }}
    >
      Kube has been updated — tap to refresh
    </button>
  );
}
