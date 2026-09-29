import "server-only";
import { DATA_SUPABASE_KEY, DATA_SUPABASE_URL } from "./env";

// Lecture des données publiques (base dataparl, RLS : select ouvert).

export type Mouvement = {
  id: string;
  date_event: string;
  chambre: "assemblee" | "senat" | "europarl";
  type: "arrivee" | "depart" | "transfert";
  collab_nom: string;
  collab_prenom: string;
  collab_civilite: string;
  elu_cle: string;
  elu_id: string;
  elu_nom: string;
  elu_groupe: string;
  elu_origine_nom: string;
  elu_origine_groupe: string;
  fonction: string;
  contexte: string;
  source: string;
  confiance: string;
};

export const COLONNES_PUBLIQUES =
  "id,date_event,chambre,type,collab_nom,collab_prenom,collab_civilite,elu_cle,elu_id,elu_nom,elu_groupe," +
  "elu_origine_nom,elu_origine_groupe,fonction,contexte,source,confiance";

export async function dataQuery<T>(table: string, params: URLSearchParams, revalidate = 300): Promise<{ rows: T[]; total: number | null }> {
  const url = `${DATA_SUPABASE_URL}/rest/v1/${table}?${params.toString()}`;
  const r = await fetch(url, {
    headers: { apikey: DATA_SUPABASE_KEY, Authorization: `Bearer ${DATA_SUPABASE_KEY}`, Prefer: "count=estimated" },
    next: { revalidate },
  });
  if (!r.ok) throw new Error(`dataparl ${table} : HTTP ${r.status}`);
  const range = r.headers.get("content-range");
  const total = range && range.includes("/") && !range.endsWith("*") ? Number(range.split("/")[1]) : null;
  return { rows: (await r.json()) as T[], total };
}

export async function derniersMouvements(limit = 40): Promise<Mouvement[]> {
  const p = new URLSearchParams({
    select: COLONNES_PUBLIQUES,
    source: "eq.live",
    order: "date_event.desc,chambre.asc",
    limit: String(limit),
  });
  return (await dataQuery<Mouvement>("mouvements", p)).rows;
}

export async function compteAffectations(): Promise<Record<string, number>> {
  const out: Record<string, number> = {};
  for (const chambre of ["assemblee", "senat"]) {
    const p = new URLSearchParams({ select: "elu_cle", chambre: `eq.${chambre}`, limit: "1" });
    out[chambre] = (await dataQuery<unknown>("affectations", p, 3600)).total ?? 0;
  }
  return out;
}
