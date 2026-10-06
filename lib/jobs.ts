// Helpers DataParl' Jobs — titre standard, slug et chambres.

export type Chambre = "an" | "senat" | "pe";

export const CHAMBRES: { valeur: Chambre; libelle: string }[] = [
  { valeur: "an", libelle: "Assemblée nationale" },
  { valeur: "senat", libelle: "Sénat" },
  { valeur: "pe", libelle: "Parlement européen" },
];

export const SIGLE: Record<Chambre, string> = { an: "An", senat: "Sénat", pe: "PE" };

export type OffreBase = {
  id: string;
  titre: string;
  chambre: string | null;
  departement: string | null;
  elu_prenom: string | null;
  elu_nom: string | null;
  groupe_politique: string | null;
};

// Format standard du nom d'offre :
//   [An/Sénat/PE] Département - Prénom NOM de l'élu (Parti) : Nom de l'offre d'emploi
export function titreStandard(o: OffreBase): string {
  const chambre = SIGLE[(o.chambre as Chambre) ?? "an"] ?? "An";
  const dept = o.departement ? " " + o.departement : "";
  const elu = [o.elu_prenom ?? "", (o.elu_nom ?? "").toUpperCase()].filter(Boolean).join(" ");
  const parti = o.groupe_politique ? " (" + o.groupe_politique + ")" : "";
  return "[" + chambre + "]" + dept + (elu ? " - " + elu : "") + parti + " : " + o.titre;
}

const slugPart = (x: string) =>
  x
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Slug d'offre : <id>_<chambre>_<Prenom>_<NOMELU>_<nom-de-l-offre>
export function slugOffre(o: OffreBase): string {
  return [o.id, o.chambre ?? "an", o.elu_prenom ?? "", (o.elu_nom ?? "").toUpperCase(), o.titre]
    .filter(Boolean)
    .map(slugPart)
    .join("_");
}

// L'id uuid est le premier segment du slug.
export function idDepuisSlug(slug: string): string | null {
  const m = slug.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  return m ? m[0] : null;
}
