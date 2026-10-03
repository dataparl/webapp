// Pages collectives : groupes parlementaires, départements et partis.
// Adresses :
//   /groupe/{chambre}-{slug du sigle}/  ex. /groupe/senat-rn/, /groupe/an-lfi-nfp/
//   /departement/{slug du département}/ ex. /departement/gironde/
//   /parti/{slug du sigle}/              ex. /parti/rn/ (toutes chambres)
// Logique pure, sans « server-only », pour être testée hors Next.

export const CHAMBRE_COURTE: Record<string, string> = { assemblee: "an", senat: "senat", europarl: "pe" };
export const CHAMBRES: readonly string[] = ["assemblee", "senat", "europarl"];

// Slug d'un collectif (sigle de groupe ou de parti) : « GUE/NGL » → « gue-ngl »,
// « LFI-NFP » → « lfi-nfp ». Accents retirés, seuls lettres et chiffres restent.
export function slugCollectif(nom: string): string {
  return (nom || "").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase()
    .replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// Adresse de la fiche d'un groupe parlementaire (chambre + sigle).
export function hrefGroupe(chambre: string, sigle: string): string | null {
  const c = CHAMBRE_COURTE[chambre];
  const s = slugCollectif(sigle);
  if (!c || !s) return null;
  return `/groupe/${c}-${s}/`;
}

// Adresse de la fiche des élus d'un département.
export function hrefDepartement(departement: string, slugDe: (nom: string) => string): string | null {
  const s = slugDe(departement);
  return s ? `/departement/${s}/` : null;
}

// Adresse de la fiche d'un parti (sigle, toutes chambres confondues).
export function hrefParti(sigle: string): string | null {
  const s = slugCollectif(sigle);
  return s ? `/parti/${s}/` : null;
}

// Décompose un slug de groupe « senat-rn » en { chambre, slugSigle }.
// Le préfixe de chambre (an, senat, pe) est testé en premier : le sigle peut
// lui-même contenir des tirets (« lfi-nfp », « crce-k »).
export function decomposerSlugGroupe(slug: string): { chambre: string; slugSigle: string } | null {
  for (const [chambre, courte] of Object.entries(CHAMBRE_COURTE)) {
    if (slug.startsWith(`${courte}-`)) return { chambre, slugSigle: slug.slice(courte.length + 1) };
  }
  return null;
}

// Un sigle n'est pas un vrai groupe politique (« Aucun », vide).
export const sansGroupe = (sigle: string) => !sigle || sigle === "Aucun";

// Retrouve un groupe dans une liste (chambre, sigle) à partir d'un slug.
export type GroupeExistant = { chambre: string; groupe: string; groupe_libelle: string };
export function groupeDepuisSlug(slug: string, existants: readonly GroupeExistant[]): GroupeExistant | null {
  const d = decomposerSlugGroupe(slug);
  if (!d) return null;
  return existants.find((g) => g.chambre === d.chambre && slugCollectif(g.groupe) === d.slugSigle) ?? null;
}

// Retrouve un parti (sigle, toutes chambres) à partir d'un slug.
export function partiDepuisSlug(slug: string, sigles: readonly string[]): string | null {
  return sigles.find((s) => slugCollectif(s) === slug) ?? null;
}
