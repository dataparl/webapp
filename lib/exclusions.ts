// Exclusions de mouvements — filtre permanent + mesures ponctuelles.
//
// Filtre permanent : au Parlement européen, les tiers payants et les
// prestataires de services spécialisés sont le plus souvent des sociétés
// (ex. ACIEM, SIGNAT'S). Elles restent dans les affectations et leurs pages
// dédiées (/collab/pe/tiers-payants, /collab/pe/prestataires), mais n'ont pas
// leur place dans le flux des mouvements ni dans les compteurs de personnes.
//
// Exclusions temporaires (à retirer une fois corrigé à la source, dépôt
// collaborateurs) :
// - 2026-10-09 (Sénat) : une republication des listes a généré des « arrivées »
//   datées du jour qui ne sont pas les vraies dates d'arrivée.
// - 2026-10-09 (europarl) : la reprise du suivi a comparé un état incomplet
//   (initialisation le 2026-10-08 : 458 affectations) au lendemain (536) :
//   les 78 « arrivées » sont des artefacts du premier relevé, pas des
//   mouvements réels.
export type ExclusionMvt = { chambre: string; type: string; date_event: string };

export const EXCLUSIONS_MVTS: ExclusionMvt[] = [
  { chambre: "senat", type: "arrivee", date_event: "2026-10-09" },
  { chambre: "europarl", type: "arrivee", date_event: "2026-10-09" },
];

// Fonctions du Parlement européen désignant une société, pas une personne.
export const FONCTIONS_SOCIETES = ["Tiers payant", "Prestataire de services spécialisé"];

export function mouvementExclu(m: { chambre: string; type: string; date_event: string; fonction?: string }): boolean {
  if (m.chambre === "europarl" && m.fonction && FONCTIONS_SOCIETES.includes(m.fonction)) return true;
  return EXCLUSIONS_MVTS.some((e) => e.chambre === m.chambre && e.type === m.type && e.date_event === m.date_event);
}

// Paramètre PostgREST (valeur de « not.or ») excluant sociétés et exclusions
// ponctuelles de toutes les requêtes de mouvements.
export function paramExclusionMvts(): string {
  const clauses = EXCLUSIONS_MVTS.map((e) => `and(chambre.eq.${e.chambre},type.eq.${e.type},date_event.eq.${e.date_event})`);
  clauses.push(`and(chambre.eq.europarl,fonction.in.(${FONCTIONS_SOCIETES.map((f) => `"${f}"`).join(",")}))`);
  return "(" + clauses.join(",") + ")";
}

// Ajuste une ligne agrégée de mouvements_par_jour : retire les arrivées
// exclues du compte (n et arrivees) ; renvoie la ligne inchangée sinon.
export function ajusterJournee(r: { date_event: string; chambre: string; n: number; arrivees: number; departs: number; transferts: number }) {
  const ex = EXCLUSIONS_MVTS.find((e) => e.chambre === r.chambre && e.date_event === r.date_event && e.type === "arrivee");
  if (!ex) return r;
  return { ...r, n: Math.max(0, r.n - r.arrivees), arrivees: 0 };
}
