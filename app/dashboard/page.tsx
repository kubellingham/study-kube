"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/use-user";
import Header from "@/app/components/Header";
import BrandLoader from "@/app/components/BrandLoader";
import DashboardClient from "./DashboardClient";

export default function DashboardPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading || !user) {
    return <BrandLoader />;
  }

  return (
    <>
      <Header />
      <DashboardClient uid={user.uid} />
    </>
  );
}
