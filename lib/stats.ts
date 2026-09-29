import "server-only";
import { dataQueryTout } from "./data";

export type StatElu = {
  chambre: "assemblee" | "senat" | "europarl"; elu_cle: string; elu_id: string; elu_nom: string; elu_groupe: string;
  effectif: number; departs_12m: number; arrivees_12m: number; departs_total: number; premier_depart: string | null;
  femmes: number; hommes: number; indetermines: number;
};

export async function statsElus(): Promise<StatElu[]> {
  const p = new URLSearchParams({ select: "*", order: "chambre,elu_cle" });
  return dataQueryTout<StatElu>("stats_turnover_elus", p, 3600);
}

export type Agregat = {
  cle: string; elus: number; effectif: number; departs_12m: number; arrivees_12m: number;
  femmes: number; hommes: number; indetermines: number;
};

export function agreger(rows: StatElu[], cle: (r: StatElu) => string): Agregat[] {
  const m = new Map<string, Agregat>();
  for (const r of rows) {
    const k = cle(r) || "Sans groupe";
    const a = m.get(k) ?? { cle: k, elus: 0, effectif: 0, departs_12m: 0, arrivees_12m: 0, femmes: 0, hommes: 0, indetermines: 0 };
    a.elus += 1; a.effectif += r.effectif; a.departs_12m += r.departs_12m; a.arrivees_12m += r.arrivees_12m;
    a.femmes += r.femmes; a.hommes += r.hommes; a.indetermines += r.indetermines;
    m.set(k, a);
  }
  return [...m.values()];
}

// Taux de renouvellement sur 12 mois = départs / effectif moyen, l'effectif moyen
// étant estimé comme la moyenne entre l'effectif il y a un an
// (effectif actuel - arrivées + départs) et l'effectif actuel.
export function tauxTurnover(x: { effectif: number; departs_12m: number; arrivees_12m: number }): number | null {
  const moyen = x.effectif + (x.departs_12m - x.arrivees_12m) / 2;
  return moyen > 0 ? x.departs_12m / moyen : null;
}

// Part de femmes parmi les collaborateurs dont le genre est déterminé.
export function partFemmes(x: { femmes: number; hommes: number }): number | null {
  const n = x.femmes + x.hommes;
  return n > 0 ? x.femmes / n : null;
}

export const pct = (v: number | null, d = 0) => (v === null ? "–" : `${(v * 100).toLocaleString("fr-FR", { maximumFractionDigits: d, minimumFractionDigits: d })} %`);
