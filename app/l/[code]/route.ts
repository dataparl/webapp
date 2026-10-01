import { NextResponse } from "next/server";
import { appareilDe, CODE, masquerIp, sourceDe } from "@/lib/liens";
import { authAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

// Lien tracé : enregistre le clic (provenance, pays, IP tronquée) puis redirige.
export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const accueil = NextResponse.redirect("https://www.dataparl.fr/", 302);
  if (!CODE.test(code)) return accueil;
  const db = authAdmin();
  const { data } = await db.from("liens").select("destination, actif").eq("code", code).maybeSingle();
  if (!data?.actif) return accueil;
  const u = new URL(req.url);
  const h = req.headers;
  {
    const { error } = await db.from("liens_clics").insert({
      code, ip: masquerIp(h.get("x-forwarded-for")), pays: h.get("x-vercel-ip-country"),
      source: sourceDe(h.get("referer"), u.searchParams.get("utm_source")), referent: (h.get("referer") ?? "").slice(0, 300) || null,
      utm_source: u.searchParams.get("utm_source")?.slice(0, 60) ?? null, appareil: appareilDe(h.get("user-agent")),
    });
    if (error) console.error("lien tracé", error.message);
  }
  return NextResponse.redirect(data.destination as string, { status: 302, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex", "Referrer-Policy": "no-referrer" } });
}
