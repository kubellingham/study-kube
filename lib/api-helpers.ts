import { createClient } from "@/lib/supabase/server";
import type { Material } from "@/lib/types";

/**
 * Resolve the signed-in user and one of their materials (RLS guarantees
 * ownership). Returns either an error Response or the loaded data.
 */
export async function requireMaterial(materialId: unknown): Promise<
  | { ok: true; supabase: Awaited<ReturnType<typeof createClient>>; userId: string; material: Material }
  | { ok: false; response: Response }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, response: Response.json({ error: "Not signed in." }, { status: 401 }) };
  }
  if (typeof materialId !== "string" || !materialId) {
    return { ok: false, response: Response.json({ error: "Missing material_id." }, { status: 400 }) };
  }
  const { data: material, error } = await supabase
    .from("materials")
    .select("*")
    .eq("id", materialId)
    .single();
  if (error || !material) {
    return { ok: false, response: Response.json({ error: "Material not found." }, { status: 404 }) };
  }
  return { ok: true, supabase, userId: user.id, material: material as Material };
}
