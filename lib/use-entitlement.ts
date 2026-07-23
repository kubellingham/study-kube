"use client";

// Client view of the signed-in user's access. UX only — the real gate is
// server-side on each paid route. `null` = still loading; refetch() re-pulls
// after a redemption.
import { useCallback, useEffect, useState } from "react";
import { authedFetch } from "@/lib/authed-fetch";
import { LOCKED, type Entitlement } from "@/lib/entitlement";
import { useUser } from "@/lib/use-user";

export function useEntitlement(): { entitlement: Entitlement | null; refetch: () => void } {
  const { user, loading } = useUser();
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);

  const refetch = useCallback(() => {
    if (!user) {
      setEntitlement(LOCKED);
      return;
    }
    authedFetch("/api/entitlement")
      .then((r) => r.json())
      .then((e: Entitlement) => setEntitlement(e))
      .catch(() => setEntitlement(LOCKED));
  }, [user]);

  useEffect(() => {
    if (loading) return;
    refetch();
  }, [loading, refetch]);

  return { entitlement, refetch };
}
