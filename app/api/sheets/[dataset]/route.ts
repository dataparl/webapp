import { NextResponse } from "next/server";
import { estDebloque } from "@/lib/deblocage";
import { identifierAdmin } from "@/lib/adminAuth";
import { feuille } from "@/lib/sheets";
import { feuillesPubliees } from "@/lib/sheetsPublication";
import { utilisateur } from "@/lib/userAuth";

export const dynamic = "force-dynamic";

// Données d'une feuille du tableur DataParl' Sheets, pour la personne
// connectée qui l'a débloquée (vidéo publicitaire) — l'équipe n'a pas de
// publicité et reçoit la grille modifiable ; les autres comptes la reçoivent
// en lecture seule.
export async function GET(req: Request, { params }: { params: Promise<{ dataset: string }> }) {
  const user = await utilisateur(req);
  if (!user) return NextResponse.json({ error: "connexion requise" }, { status: 401, headers: { "Cache-Control": "private, no-store" } });
  const id = (await params).dataset;
  const f = feuille(id);
  const publiee = f && (await feuillesPubliees()).includes(id);
  if (!f || !publiee) return NextResponse.json({ error: "feuille inconnue" }, { status: 404, headers: { "Cache-Control": "private, no-store" } });
  const d = await estDebloque(user.id, `feuille:${id}`);
  if (!d.ok) return NextResponse.json({ error: "deblocage requis" }, { status: 403, headers: { "Cache-Control": "private, no-store" } });
  let lignes: Awaited<ReturnType<typeof f.charger>> = [];
  try { lignes = await f.charger(); } catch { /* réponse d'erreur ci-dessous */ }
  if (lignes.length === 0) return NextResponse.json({ error: "donnees indisponibles" }, { status: 503, headers: { "Cache-Control": "private, no-store" } });
  const equipe = await identifierAdmin(req).catch(() => null);
  return NextResponse.json({
    titre: f.titre,
    description: f.description,
    provenance: f.provenance,
    entetes: f.colonnes.map((c) => c.label),
    donnees: lignes.map((l) => f.colonnes.map((c) => l[c.cle] ?? null)),
    modifiable: !!(equipe && equipe.ok),
    expire_le: d.expire_le ?? null,
  }, { headers: { "Cache-Control": "private, no-store" } });
}
