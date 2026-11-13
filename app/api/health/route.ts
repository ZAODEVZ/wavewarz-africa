import { NextResponse } from "next/server";
import { getStats, site } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/health: which backend this frontend reads and whether it answers.
export async function GET() {
  const stats = await getStats();
  return NextResponse.json({
    ok: Boolean(stats),
    site: site.name,
    region: site.region,
    api: site.apiBase,
    battles: stats?.battles.total ?? null,
    apiUpdatedAt: stats?.updatedAt ?? null,
  });
}
