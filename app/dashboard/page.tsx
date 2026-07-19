import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Header from "@/app/components/Header";
import DashboardClient from "./DashboardClient";
import type { Material } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: materials } = await supabase
    .from("materials")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <>
      <Header email={user.email} />
      <DashboardClient initialMaterials={(materials as Material[]) ?? []} />
    </>
  );
}
