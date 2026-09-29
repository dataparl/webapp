import { NextResponse } from "next/server";
import { COLONNES_PUBLIQUES, dataQuery, type Mouvement } from "@/lib/data";

// GET https://api.cavaparlement.eu/mouvements
//   ?chambre=assemblee|senat|europarl  ?type=arrivee|depart|transfert
//   ?depuis=AAAA-MM-JJ  ?jusqua=AAAA-MM-JJ  ?elu=<elu_cle ou elu_id>
//   ?source=live|regardscitoyens|wayback  ?limit=1..500  ?offset=0..

const CHAMBRES = new Set(["assemblee", "senat", "europarl"]);
const TYPES = new Set(["arrivee", "depart", "transfert"]);
const SOURCES = new Set(["live", "regardscitoyens", "wayback"]);
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, OPTIONS" };

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const limit = Math.min(Math.max(Number(q.get("limit") ?? 100) || 100, 1), 500);
  const offset = Math.max(Number(q.get("offset") ?? 0) || 0, 0);
  const p = new URLSearchParams({ select: COLONNES_PUBLIQUES, order: "date_event.desc,id.asc", limit: String(limit), offset: String(offset) });

  const chambre = q.get("chambre");
  if (chambre) { if (!CHAMBRES.has(chambre)) return erreur("chambre"); p.set("chambre", `eq.${chambre}`); }
  const type = q.get("type");
  if (type) { if (!TYPES.has(type)) return erreur("type"); p.set("type", `eq.${type}`); }
  const source = q.get("source");
  if (source) { if (!SOURCES.has(source)) return erreur("source"); p.set("source", `eq.${source}`); }
  const depuis = q.get("depuis"), jusqua = q.get("jusqua");
  if (depuis && !DATE.test(depuis)) return erreur("depuis");
  if (jusqua && !DATE.test(jusqua)) return erreur("jusqua");
  if (depuis && jusqua) p.set("and", `(date_event.gte.${depuis},date_event.lte.${jusqua})`);
  else if (depuis) p.set("date_event", `gte.${depuis}`);
  else if (jusqua) p.set("date_event", `lte.${jusqua}`);
  const elu = q.get("elu");
  if (elu) {
    if (!/^[\p{L}\p{N} .'-]{1,80}$/u.test(elu)) return erreur("elu");
    p.set("or", `(elu_cle.eq."${elu}",elu_id.eq."${elu}")`);
  }

  try {
    const { rows, total } = await dataQuery<Mouvement>("mouvements", p, 300);
    return NextResponse.json(
      { total, limit, offset, mouvements: rows, licence: "Licence Ouverte (AN, Sénat) ; historique ODbL (Regards Citoyens)" },
      { headers: { ...CORS, "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
    );
  } catch {
    return NextResponse.json({ error: "données indisponibles" }, { status: 503, headers: CORS });
  }
}

function erreur(param: string) {
  return NextResponse.json({ error: `paramètre invalide : ${param}` }, { status: 400, headers: CORS });
}
