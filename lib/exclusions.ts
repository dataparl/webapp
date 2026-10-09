// Exclusions temporaires de mouvements — mesure ponctuelle, à retirer.
// Le 2026-10-09, une republication des listes du Sénat a généré des « arrivées »
// datées du jour qui ne sont pas les vraies dates d'arrivée des collaborateurs.
// On les masque des listes de mouvements, du DataParl' Daily et du DataParl'
// Weekly le temps de corriger les dates à la source (dépôt collaborateurs).
// Retirer l'entrée ci-dessous une fois les dates corrigées ; les usages
// (paramExclusionMvts, mouvementExclu, ajusterJournee) deviennent inactifs
// dès que la liste est vide.
export type ExclusionMvt = { chambre: string; type: string; date_event: string };

export const EXCLUSIONS_MVTS: ExclusionMvt[] = [
  { chambre: "senat", type: "arrivee", date_event: "2026-10-09" },
];

export function mouvementExclu(m: { chambre: string; type: string; date_event: string }): boolean {
  return EXCLUSIONS_MVTS.some((e) => e.chambre === m.chambre && e.type === m.type && e.date_event === m.date_event);
}

// Paramètre PostgREST (valeur de « not.or ») excluant ces mouvements, ou null.
export function paramExclusionMvts(): string | null {
  if (!EXCLUSIONS_MVTS.length) return null;
  return "(" + EXCLUSIONS_MVTS.map((e) => `and(chambre.eq.${e.chambre},type.eq.${e.type},date_event.eq.${e.date_event})`).join(",") + ")";
}

// Ajuste une ligne agrégée de mouvements_par_jour : retire les arrivées
// exclues du compte (n et arrivees) ; renvoie la ligne inchangée sinon.
export function ajusterJournee(r: { date_event: string; chambre: string; n: number; arrivees: number; departs: number; transferts: number }) {
  const ex = EXCLUSIONS_MVTS.find((e) => e.chambre === r.chambre && e.date_event === r.date_event && e.type === "arrivee");
  if (!ex) return r;
  return { ...r, n: Math.max(0, r.n - r.arrivees), arrivees: 0 };
}
