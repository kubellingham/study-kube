"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useUser } from "@/lib/use-user";
import Header from "@/app/components/Header";
import MaterialWorkspace from "./MaterialWorkspace";
import type { Material } from "@/lib/types";

export default function MaterialPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { user, loading } = useUser();
  const router = useRouter();
  const [material, setMaterial] = useState<Material | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    (async () => {
      const snap = await getDoc(doc(db(), "materials", id));
      if (snap.exists() && snap.get("userId") === user.uid) {
        setMaterial({ id: snap.id, ...snap.data() } as Material);
      }
      setChecked(true);
    })();
  }, [id, user, loading, router]);

  if (loading || !checked) {
    return (
      <div className="flex-1 grid place-items-center text-sm text-slate-400">
        Loading…
      </div>
    );
  }

  if (!material || !user) {
    return (
      <>
        <Header />
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-16 text-center">
          <p className="text-slate-500">Material not found.</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <MaterialWorkspace material={material} uid={user.uid} />
    </>
  );
}
