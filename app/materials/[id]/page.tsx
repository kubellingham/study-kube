import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Header from "@/app/components/Header";
import MaterialWorkspace from "./MaterialWorkspace";
import type { Material } from "@/lib/types";

export default async function MaterialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: material } = await supabase
    .from("materials")
    .select("*")
    .eq("id", id)
    .single();

  if (!material) notFound();

  return (
    <>
      <Header email={user.email} />
      <MaterialWorkspace material={material as Material} />
    </>
  );
}
