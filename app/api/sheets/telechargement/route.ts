import { NextResponse } from "next/server";
import { dataAdmin } from "@/lib/supabaseAdmin";
import { utilisateur } from "@/lib/userAuth";

export const dynamic = "force-dynamic";

// Journal des téléchargements CSV de DataParl' Sheets : chaque export est
// enregistré avec le compte (utilisateur connecté) et l'adresse IP, pour
// l'espace équipe (liste dans l'admin, module comptes).
export async function POST(req: Request) {
  const user = await utilisateur(req);
  if (!user) return NextResponse.json({ error: "connexion requise" }, { status: 401, headers: { "Cache-Control": "private, no-store" } });
  const corps = (await req.json().catch(() => ({}))) as { feuille?: unknown; lignes?: unknown };
  const feuille = typeof corps.feuille === "string" ? corps.feuille.slice(0, 80) : "";
  if (!feuille) return NextResponse.json({ error: "feuille requise" }, { status: 400, headers: { "Cache-Control": "private, no-store" } });
  const h = req.headers;
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "";
  try {
    await dataAdmin().from("telechargements").insert({
      feuille,
      lignes: typeof corps.lignes === "number" && Number.isFinite(corps.lignes) ? Math.max(0, Math.min(1000000, Math.round(corps.lignes))) : 0,
      user_id: user.id,
      email: (user.email ?? "").slice(0, 200),
      ip: ip.slice(0, 60),
      user_agent: (h.get("user-agent") ?? "").slice(0, 300),
    });
  } catch {
    // Le journal ne doit jamais bloquer un téléchargement.
  }
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "private, no-store" } });
}
