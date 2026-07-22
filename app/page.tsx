"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/use-user";
import BrandLoader from "@/app/components/BrandLoader";

export default function Home() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Kube IS the landing now — everything happens inside /learn.
    if (!loading) router.replace(user ? "/learn" : "/login");
  }, [user, loading, router]);

  return <BrandLoader label="Getting your ladder ready…" />;
}
