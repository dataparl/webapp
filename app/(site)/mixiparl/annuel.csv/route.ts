import { partFemmes, statsAnnuelles } from "@/lib/stats";

export const revalidate = 3600;

// Table annuelle MixiParl' (ODbL 1.0, source DataParl').
export async function GET() {
  let rows;
  try { rows = await statsAnnuelles(); } catch {
    return new Response("Données momentanément indisponibles.\n", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
  }
  const lignes = [
    "annee,chambre,effectif_1er_janvier,femmes,hommes,genre_indetermine,part_femmes",
    ...rows.map((r) => [r.an, r.chambre, r.effectif, r.femmes, r.hommes, r.effectif - r.femmes - r.hommes, partFemmes(r)?.toFixed(4) ?? ""].join(",")),
  ];
  return new Response(`${lignes.join("\n")}\n`, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="mixiparl-annuel.csv"', "Cache-Control": "public, s-maxage=3600" },
  });
}
