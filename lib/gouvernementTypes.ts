// Types et petites fonctions partagés (serveur et navigateur) pour /gouvernement.

export type MandatMinistre = {
  id: string; prenom: string; nom: string; fonction: string; portefeuille: string;
  gouvernement: string; debut: string; fin: string | null;
};
export type MembreCabinet = {
  id: string; ministre_id: string; collab_cle: string; collab_prenom: string; collab_nom: string;
  fonction: string; debut: string; fin: string | null; collab_id: string | null;
};

// Recherche insensible aux accents, casse et ponctuation.
export const normaliseNom = (s: string) =>
  s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export const periode = (debut: string, fin: string | null) => {
  const d = debut.slice(0, 10).split("-").reverse().join("/");
  if (!fin) return "depuis le " + d;
  return d + " → " + fin.slice(0, 10).split("-").reverse().join("/");
};

export type CategorieFonction = "direction" | "chefferie" | "conseil" | "autre";
export const LIBELLE_FONCTION: Record<CategorieFonction, string> = {
  direction: "Direction de cabinet",
  chefferie: "Chef·fe de cabinet",
  conseil: "Conseiller·ère",
  autre: "Autres fonctions",
};
export const ORDRE_FONCTION: Record<CategorieFonction, number> = { direction: 0, chefferie: 1, conseil: 2, autre: 3 };
export function categorieFonction(f: string): CategorieFonction {
  const n = normaliseNom(f);
  if (n.startsWith("directeur") || n.startsWith("directrice")) return "direction";
  if (n.startsWith("chef")) return "chefferie";
  if (n.startsWith("conseiller")) return "conseil";
  return "autre";
}
