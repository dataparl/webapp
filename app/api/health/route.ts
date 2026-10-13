import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Route santé pour le monitoring uptime (UptimeRobot, etc.).
// 200 = site + base OK ; 503 = base injoignable.
export async function GET() {
  try {
    const url = process.env.DATA_SUPABASE_URL;
    const key = process.env.DATA_SUPABASE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("variables Supabase absentes");
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    // Requête la plus légère possible : limite 1 sur la table de référence.
    const { error } = await supabase.from("ministres").select("id", { head: true, count: "exact" });
    if (error) throw error;
    return NextResponse.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json(
      { status: "error", detail: e instanceof Error ? e.message : "inconnu" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}

// HEAD doit renvoyer la même chose que GET (UptimeRobot fait des HEAD).
export async function HEAD() {
  const r = await GET();
  return new Response(null, { status: r.status, headers: r.headers });
}
