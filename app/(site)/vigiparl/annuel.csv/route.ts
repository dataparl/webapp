import { statsAnnuelles, turnoverAnnuel } from "@/lib/stats";

export const revalidate = 3600;

// Table annuelle VigiParl' (ODbL 1.0, source DataParl').
export async function GET() {
  let rows;
  try { rows = await statsAnnuelles(); } catch {
    return new Response("Données momentanément indisponibles.\n", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
  }
  const lignes = [
    "annee,chambre,effectif_1er_janvier,effectif_1er_janvier_suivant,departs_comptes,departs_fin_mandat_exclus,arrivees_comptees,arrivees_debut_mandat_exclues,taux_renouvellement",
    ...rows.map((r) => [r.an, r.chambre, r.effectif, r.effectif_suivant, r.departs, r.departs_fin_mandat ?? 0, r.arrivees, r.arrivees_debut_mandat ?? 0, turnoverAnnuel(r)?.toFixed(4) ?? ""].join(",")),
  ];
  return new Response(`${lignes.join("\n")}\n`, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="vigiparl-annuel.csv"', "Cache-Control": "public, s-maxage=3600" },
  });
}
