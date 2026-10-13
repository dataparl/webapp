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

// Fin effective d'un poste : le JORF publie rarement les cessations quand le
// ministre quitte ses fonctions. Un poste sans fin rattaché à un mandat terminé
// prend donc la fin du mandat — sinon il s'afficherait « en poste » à tort.
export const finEffective = (fin: string | null, finMandat: string | null): string | null => fin ?? finMandat;
export const enPoste = (fin: string | null, finMandat: string | null): boolean => finEffective(fin, finMandat) === null;

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

// ── Documentation des cabinets ─────────────────────────────────────────────
// Trois statuts distincts, pour ne jamais confondre « pas de cabinet » et
// « pas de données identifiées » (le JORF publie au fil de l'eau).
export type StatutCabinet = "documente" | "nonRetrouve" | "verification";
export const LIBELLE_STATUT: Record<StatutCabinet, string> = {
  documente: "Cabinet documenté",
  nonRetrouve: "Publication non retrouvée",
  verification: "En cours de vérification",
};
const FENETRE_VERIFICATION_MS = 183 * 24 * 3600 * 1000;
// Un mandat récent (moins de 6 mois) sans membre identifié est « en cours de
// vérification » : les décrets de nomination paraissent souvent avec du retard.
export function statutCabinet(debut: string, nMembres: number): StatutCabinet {
  if (nMembres > 0) return "documente";
  const t = Date.parse(debut.slice(0, 10) + "T00:00:00Z");
  return Number.isFinite(t) && Date.now() - t < FENETRE_VERIFICATION_MS ? "verification" : "nonRetrouve";
}
