import { APP_VERSION } from "@/lib/version";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(
    { version: APP_VERSION },
    { headers: { "Cache-Control": "no-store" } }
  );
}
