import { statsAnnuelles, turnoverAnnuel } from "@/lib/stats";

export const revalidate = 3600;
export const dynamic = "force-static";

// Données annuelles VigiParl' au format CSV, pour la visualisation publiée
// sur Google Sheets (drive.dataparl.fr/sheets/vigiparl/annual-chart). Une
// feuille Google peut les suivre automatiquement avec :
//   =IMPORTDATA("https://drive.dataparl.fr/sheets/vigiparl/annual-chart")
const CHAMBRE_LONG: Record<string, string> = { assemblee: "Assemblée nationale", senat: "Sénat", europarl: "Parlement européen" };

export async function GET() {
  const annees = await statsAnnuelles().catch(() => []);
  const lignes = [
    "annee,chambre,effectif_1er_janvier,effectif_1er_janvier_suivant,arrivees_comptees,arrivees_exclues_debut_mandat,departs_comptes,departs_exclus_fin_mandat,taux_renouvellement",
    ...annees.map((a) => [
      a.an,
      `"${CHAMBRE_LONG[a.chambre] ?? a.chambre}"`,
      a.effectif,
      a.effectif_suivant,
      a.arrivees ?? 0,
      a.arrivees_debut_mandat ?? 0,
      a.departs,
      a.departs_fin_mandat ?? 0,
      (() => { const t = turnoverAnnuel(a); return t === null ? "" : (t * 100).toFixed(1).replace(".", ","); })(),
    ].join(",")),
  ];
  // BOM UTF-8 pour que Sheets/Excel détectent l'encodage, CRLF standard CSV.
  return new Response("\uFEFF" + lignes.join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
