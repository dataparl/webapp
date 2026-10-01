// Indicateurs de mixité des équipes (sans dépendance, testé).
// Équipes éligibles aux indicateurs de mixité : 2 personnes ou plus, toutes de genre déterminé.
export function mixite(rows: { femmes: number; hommes: number; indetermines: number }[]) {
  const deuxPlus = rows.filter((r) => r.femmes + r.hommes + r.indetermines >= 2);
  const eligibles = deuxPlus.filter((r) => r.indetermines === 0);
  const paritaires = eligibles.filter((r) => { const p = r.femmes / (r.femmes + r.hommes); return p >= 0.4 && p <= 0.6; }).length;
  const nonMixtes = eligibles.filter((r) => r.femmes === 0 || r.hommes === 0).length;
  return { eligibles: eligibles.length, exclues: deuxPlus.length - eligibles.length, paritaires, nonMixtes };
}

