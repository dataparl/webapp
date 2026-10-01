import { dateTitre, dateValide, joursPublies } from "@/lib/daily";
import { imageOg, TAILLE_OG } from "@/lib/og";

export const alt = "Les mouvements de collaborateurs parlementaires du jour";
export const size = TAILLE_OG;
export const contentType = "image/png";
export const revalidate = 3600;

export default async function Image({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const jour = dateValide(date) ? (await joursPublies(date, date).catch(() => []))[0] : undefined;
  const total = jour?.n ?? 0;
  return imageOg({
    surtitre: `Les mouvements du ${dateValide(date) ? dateTitre(date) : "jour"}`,
    chiffre: total ? total.toLocaleString("fr-FR") : undefined,
    legende: total ? `arrivée${total > 1 ? "s" : ""}, départ${total > 1 ? "s" : ""} et transfert${total > 1 ? "s" : ""} de collaborateurs parlementaires` : "Aucun mouvement publié ce jour.",
  });
}
