import { redirect } from "next/navigation";
import { mandatsEtCabinets } from "@/lib/gouvernement";
import { slugGouvernement } from "@/lib/gouvernementTypes";

export const revalidate = 3600;

export const metadata = {
  title: "Gouvernement et cabinets ministériels",
  description: "Composition du gouvernement français et membres des cabinets ministériels, d'après le Journal officiel.",
};

// /gouv ouvre directement le gouvernement en exercice ; l'historique
// complet (tous les gouvernements, recherche transversale) est sur /gouv/explorer.
export default async function Gouvernement() {
  let slug: string | null = null;
  try {
    const { mandats } = await mandatsEtCabinets();
    let nom = "";
    let debut = "";
    for (const m of mandats) {
      if (m.gouvernement && m.debut > debut) { debut = m.debut; nom = m.gouvernement; }
    }
    slug = nom ? slugGouvernement(nom) : null;
  } catch {
    slug = null;
  }
  redirect(slug ? "/gouv/" + slug : "/gouv/explorer");
}
