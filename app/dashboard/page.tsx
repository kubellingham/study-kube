"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/use-user";
import Header from "@/app/components/Header";
import DashboardClient from "./DashboardClient";

export default function DashboardPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex-1 grid place-items-center text-sm text-slate-400">
        Loading…
      </div>
    );
  }

  return (
    <>
      <Header />
      <DashboardClient uid={user.uid} />
    </>
  );
}
