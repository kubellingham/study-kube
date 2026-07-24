"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/use-user";
import BrandLoader from "@/app/components/BrandLoader";
import Landing from "@/app/components/Landing";

export default function Home() {
  const { user, loading } = useUser();
  const router = useRouter();

  // Signed-in users go straight to their ladder; signed-out visitors get the
  // marketing landing (the front door).
  useEffect(() => {
    if (!loading && user) router.replace("/learn");
  }, [user, loading, router]);

  if (loading || user) return <BrandLoader label="Getting your ladder ready…" />;
  return <Landing />;
}
