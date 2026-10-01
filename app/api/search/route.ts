import { NextResponse } from "next/server";
import { rechercherSite } from "@/lib/rechercheSite";

export const dynamic = "force-dynamic";

// GET /api/search?q=…&limit=8 : élus, collaborateurs, groupes et pages, groupés par type.
export async function GET(req: Request) {
  const u = new URL(req.url).searchParams;
  const limite = Math.min(Math.max(Number(u.get("limit")) || 8, 1), 20);
  try {
    const resultats = await rechercherSite(u.get("q") ?? "", limite);
    return NextResponse.json({ resultats }, { headers: { "Cache-Control": "public, s-maxage=600" } });
  } catch {
    return NextResponse.json({ resultats: [] }, { status: 503 });
  }
}
