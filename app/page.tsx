"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/use-user";

export default function Home() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Kube IS the landing now — everything happens inside /learn.
    if (!loading) router.replace(user ? "/learn" : "/login");
  }, [user, loading, router]);

  return (
    <div className="flex-1 grid place-items-center text-sm text-slate-400">
      Loading…
    </div>
  );
}
