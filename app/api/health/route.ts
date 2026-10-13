import { NextResponse } from "next/server";
import { dataAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

// Route santé pour le monitoring uptime (UptimeRobot, etc.).
// 200 = site + base de données OK ; 503 = base injoignable.
export async function GET() {
  try {
    // Requête la plus légère possible : un count, aucune donnée renvoyée.
    const { error } = await dataAdmin().from("ministres").select("id", { head: true, count: "exact" });
    if (error) throw error;
    return NextResponse.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json(
      { status: "error", detail: e instanceof Error ? e.message : "inconnu" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}

// HEAD doit renvoyer le même statut que GET (UptimeRobot fait des HEAD).
export async function HEAD() {
  const r = await GET();
  return new Response(null, { status: r.status, headers: r.headers });
}
