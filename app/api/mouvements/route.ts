import { NextResponse } from "next/server";
import { dataQuery, parametresRecherche, type Mouvement } from "@/lib/data";
import { cleElus } from "@/lib/referentiel";
import { utilisateur } from "@/lib/userAuth";

export const dynamic = "force-dynamic";

// Recherche complète des mouvements : réservée aux comptes (gratuits).
export async function GET(req: Request) {
  const user = await utilisateur(req);
  if (!user) return NextResponse.json({ error: "connexion requise" }, { status: 401 });
  const q = new URL(req.url).searchParams;
  const g = (k: string) => q.get(k)?.trim() || undefined;
  const elu = g("elu");
  const params = parametresRecherche({
    chambre: g("chambre"), type: g("type"), groupe: g("groupe"), elus: elu ? await cleElus(elu) : undefined, q: g("q"),
    depuis: g("depuis"), jusqua: g("jusqua"), limit: Number(g("limit") ?? 50), offset: Number(g("offset") ?? 0),
  });
  if (!params) return NextResponse.json({ error: "filtre invalide" }, { status: 400 });
  try {
    const { rows, total } = await dataQuery<Mouvement>("mouvements", params, 60);
    const mouvements = rows.map((m) => ({ ...m, source: m.source === "live" ? "suivi" : "archives" }));
    return NextResponse.json({ total, mouvements }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "données indisponibles" }, { status: 503 });
  }
}
