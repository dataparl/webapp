import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { importerJour } from "@/lib/jorfImport";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Balayage quotidien du Journal officiel : les nominations et cessations de
// fonctions de la veille (le JORF est publié tôt le matin, la collecte
// nocturne des collabs passe avant). Appelé par la tâche planifiée de Vercel
// (vercel.json), protégé par CRON_SECRET. Les trois derniers jours sont
// traités : un échec isolé se rattrape le lendemain sans trou.

function autorise(req: Request): boolean {
  const s = process.env.CRON_SECRET ?? "";
  const recu = req.headers.get("authorization") ?? "";
  const attendu = `Bearer ${s}`;
  return !!s && recu.length === attendu.length && timingSafeEqual(Buffer.from(recu), Buffer.from(attendu));
}

const jour = (offset: number) => new Date(Date.now() - offset * 86_400_000).toISOString().slice(0, 10);

export async function GET(req: Request) {
  if (!autorise(req)) return NextResponse.json({ error: "non autorisé" }, { status: 401 });
  const jours = [];
  for (const d of [jour(2), jour(1)]) {
    try { jours.push(await importerJour(d)); }
    catch (e) { jours.push({ date: d, nb: 0, ministres: 0, cabinets: 0, erreurs: [(e as Error).message] }); }
  }
  return NextResponse.json({ ok: true, jours }, { headers: { "Cache-Control": "no-store" } });
}
