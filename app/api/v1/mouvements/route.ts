import { NextResponse } from "next/server";
import { consommer } from "@/lib/apiKeys";
import { COLONNES_PUBLIQUES, dataQuery, type Mouvement } from "@/lib/data";

// GET https://api.cavaparlement.eu/v1/mouvements
//   ?chambre=assemblee|senat|europarl  ?type=arrivee|depart|transfert
//   ?depuis=AAAA-MM-JJ  ?jusqua=AAAA-MM-JJ  ?elu=<identifiant de l'élu>
//   ?source=suivi|archives  ?limit=1..500  ?offset=0..

const CHAMBRES = new Set(["assemblee", "senat", "europarl"]);
const TYPES = new Set(["arrivee", "depart", "transfert"]);
// Les sources internes sont exposées sous deux noms publics.
const SOURCES: Record<string, string> = { suivi: "eq.live", archives: "in.(regardscitoyens,wayback)" };
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, X-API-Key",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(req: Request) {
  const verdict = await consommer(req);
  if (!verdict.ok) {
    return NextResponse.json({ error: verdict.message }, { status: verdict.status, headers: CORS });
  }
  const quotaHeaders = {
    "X-RateLimit-Limit": String(verdict.quota),
    "X-RateLimit-Remaining": String(Math.max(verdict.quota - verdict.requetes, 0)),
  };
  const q = new URL(req.url).searchParams;
  const limit = Math.min(Math.max(Number(q.get("limit") ?? 100) || 100, 1), 500);
  const offset = Math.max(Number(q.get("offset") ?? 0) || 0, 0);
  const p = new URLSearchParams({ select: COLONNES_PUBLIQUES, order: "date_event.desc,id.asc", limit: String(limit), offset: String(offset) });

  const chambre = q.get("chambre");
  if (chambre) { if (!CHAMBRES.has(chambre)) return erreur("chambre"); p.set("chambre", `eq.${chambre}`); }
  const type = q.get("type");
  if (type) { if (!TYPES.has(type)) return erreur("type"); p.set("type", `eq.${type}`); }
  const source = q.get("source");
  if (source) { if (!(source in SOURCES)) return erreur("source"); p.set("source", SOURCES[source]); }
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
      {
        total, limit, offset,
        mouvements: rows.map((m) => ({ ...m, source: m.source === "live" ? "suivi" : "archives" })),
        licence: "ODbL 1.0",
        attribution: "DataParl' (cavaparlement.eu), d'après les publications de l'Assemblée nationale et du Sénat",
      },
      { headers: { ...CORS, ...quotaHeaders, "Cache-Control": "private, max-age=60" } },
    );
  } catch {
    return NextResponse.json({ error: "données indisponibles" }, { status: 503, headers: CORS });
  }
}

function erreur(param: string) {
  return NextResponse.json({ error: `paramètre invalide : ${param}` }, { status: 400, headers: CORS });
}
