import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { synchroniserCommuniquesNotion } from "@/lib/notion";
import { authAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// Synchronisation quotidienne des communiqués Notion → table communiques
// (tâche planifiée Vercel, vercel.json). Le bouton « Synchroniser depuis
// Notion » de l'admin (action sync-notion) fait la même chose à la demande.
function autorise(req: Request): boolean {
  const s = process.env.CRON_SECRET ?? "";
  const recu = req.headers.get("authorization") ?? "";
  const attendu = "Bearer " + s;
  return !!s && recu.length === attendu.length && timingSafeEqual(Buffer.from(recu), Buffer.from(attendu));
}

export async function GET(req: Request) {
  if (!autorise(req)) return NextResponse.json({ error: "non autorisé" }, { status: 401 });
  try {
    const r = await synchroniserCommuniquesNotion(authAdmin());
    return NextResponse.json({ ok: r.erreurs.length === 0, ...r });
  } catch (e) {
    return NextResponse.json({ ok: false, erreur: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}