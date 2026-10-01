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

// ── Séries annuelles et durées (vues stats_annuelles, stats_durees) ─────
export type StatAnnuelle = { chambre: string; an: number; effectif: number; femmes: number; hommes: number; effectif_suivant: number; departs: number; arrivees: number; departs_fin_mandat?: number; arrivees_debut_mandat?: number };
export type StatDuree = { chambre: string; duree_mediane_jours: number | null; postes_termines: number; anciennete_mediane_jours: number | null; postes_en_cours_dates: number; postes_termines_tous?: number };
export type StatFenetre = { chambre: string; departs: number; departs_fin_mandat: number; arrivees: number; arrivees_debut_mandat: number };

// Premières années exploitables : avant, les archives ne couvrent pas l'année entière.
export const PREMIERE_ANNEE: Record<string, number> = { assemblee: 2018, senat: 2016 };

export async function statsAnnuelles(): Promise<StatAnnuelle[]> {
  const rows = await dataQueryTout<StatAnnuelle>("stats_annuelles", new URLSearchParams({ select: "*", order: "chambre,an" }), 3600);
  return rows.filter((r) => r.an >= (PREMIERE_ANNEE[r.chambre] ?? 0));
}

export async function statsDurees(): Promise<StatDuree[]> {
  return dataQueryTout<StatDuree>("stats_durees", new URLSearchParams({ select: "*" }), 3600);
}

export function turnoverAnnuel(r: StatAnnuelle): number | null {
  const moyen = (r.effectif + r.effectif_suivant) / 2;
  return moyen > 0 ? r.departs / moyen : null;
}

export const mois = (jours: number | null) => (jours === null ? "–" : `${Math.round(jours / 30.44)} mois`);

// Mouvements des 12 derniers mois, avec ceux exclus du taux (fin ou début de mandat de l'élu).
export async function statsFenetre(): Promise<StatFenetre[]> {
  return dataQueryTout<StatFenetre>("stats_fenetre_12m", new URLSearchParams({ select: "*" }), 3600);
}

export { mixite } from "./mixite";

// Version de la méthode : toute évolution est datée et décrite ici.
export const HISTORIQUE_METHODE: Record<"vigiparl" | "mixiparl", { date: string; texte: string }[]> = {
  vigiparl: [
    { date: "2026-10-01", texte: "Publication de la méthode détaillée ; départs exclus (fin de mandat de l'élu) et taux de couverture des durées affichés." },
  ],
  mixiparl: [
    { date: "2026-10-01", texte: "Les équipes comptant un membre de genre indéterminé sont exclues des indicateurs de parité et de non-mixité (auparavant, seuls les membres de genre déterminé étaient comptés)." },
  ],
};
