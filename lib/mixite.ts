// Indicateurs de mixité des équipes (sans dépendance, testé).
// Équipes éligibles aux indicateurs de mixité : 2 personnes ou plus, toutes de genre déterminé.
export function mixite(rows: { femmes: number; hommes: number; indetermines: number }[]) {
  const deuxPlus = rows.filter((r) => r.femmes + r.hommes + r.indetermines >= 2);
  const eligibles = deuxPlus.filter((r) => r.indetermines === 0);
  const paritaires = eligibles.filter((r) => { const p = r.femmes / (r.femmes + r.hommes); return p >= 0.4 && p <= 0.6; }).length;
  const nonMixtes = eligibles.filter((r) => r.femmes === 0 || r.hommes === 0).length;
  return { eligibles: eligibles.length, exclues: deuxPlus.length - eligibles.length, paritaires, nonMixtes };
}


// Taux de mixité d'une équipe : 100 % à 50/50, 0 % si l'équipe ne compte que
// des femmes ou que des hommes. tauxDeMixité = 1 − |2 × partDeFemmes − 1|.
export function tauxMixite(x: { femmes: number; hommes: number }): number | null {
  const n = x.femmes + x.hommes;
  return n > 0 ? 1 - Math.abs((2 * x.femmes) / n - 1) : null;
}

// Une équipe est éligible si elle compte 2 personnes ou plus, toutes de genre déterminé.
export const equipeEligible = (r: { femmes: number; hommes: number; indetermines: number }) =>
  r.femmes + r.hommes + r.indetermines >= 2 && r.indetermines === 0;

// Taux de mixité d'un ensemble (chambre, groupe, famille) : moyenne des taux de ses équipes éligibles.
export function mixiteMoyenne(rows: { femmes: number; hommes: number; indetermines: number }[]): { taux: number | null; equipes: number } {
  const t = rows.filter(equipeEligible).map((r) => tauxMixite(r) ?? 0);
  return { taux: t.length ? t.reduce((a, b) => a + b, 0) / t.length : null, equipes: t.length };
}
