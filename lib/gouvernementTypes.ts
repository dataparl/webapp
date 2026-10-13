// Types et petites fonctions partagés (serveur et navigateur) pour /gouvernement.

export type MandatMinistre = {
  id: string; prenom: string; nom: string; fonction: string; portefeuille: string;
  gouvernement: string; debut: string; fin: string | null;
  rang: string | null; civilite: string | null; personne_id: string | null;
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

// ── Slugs d'URL ────────────────────────────────────────────────────────────
// Gouvernement : « Lecornu II » → « lecornu-ii », « Ayrault I » → « ayrault-i ».
export const slugGouvernement = (g: string) =>
  g.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// Ministre : « Sébastien Lecornu » → « Sebastien-LECORNU »,
// « Éléonore Caroit » → « Eleonore-CAROIT ». Le slug se relit tel quel
// (comparaison insensible à la casse au décodage).
export function slugMinistre(prenom: string, nom: string): string {
  const sansAccents = (x: string) => x.normalize("NFD").replace(/\p{M}/gu, "");
  const p = sansAccents(prenom ?? "").split(/\s+/).filter(Boolean)
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()).join("-");
  const n = sansAccents(nom ?? "").toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return p && n ? p + "-" + n : p || n || "ministre";
}

// ── Ordre protocolaire ─────────────────────────────────────────────────────
// Rang issu des décrets : « PM », « ministre », « ministre délégué »,
// « secrétaire d'État ». Au sein d'un rang, l'ordre alphabétique prévaut.
export function ordreRang(rang: string | null): number {
  const n = normaliseNom(rang ?? "");
  if (n === "pm" || n.startsWith("premier ministre")) return 0;
  if (n.startsWith("ministre d etat")) return 1;
  if (n.startsWith("ministre delegue")) return 3;
  if (n.startsWith("secretaire d etat")) return 4;
  if (n.startsWith("ministre")) return 2;
  return 5;
}
export function libelleRang(rang: string | null): string {
  const n = normaliseNom(rang ?? "");
  if (n === "pm" || n.startsWith("premier ministre")) return "Premier ministre";
  if (n.startsWith("ministre d etat")) return "Ministre d'État";
  if (n.startsWith("ministre delegue")) return "Ministre délégué·e";
  if (n.startsWith("secretaire d etat")) return "Secrétaire d'État";
  return "Ministre";
}

// ── Rattachement d'un ministre délégué ──────────────────────────────────────
// « Ministre délégué auprès du ministre de l'Intérieur » → le ministre de
// l'Intérieur du même gouvernement (rapprochement par les mots du portefeuille).
const MOTS_VIDES_RATTACHEMENT = new Set([
  "ministre", "ministere", "aupres", "et", "des", "du", "de", "la", "le", "les", "d",
  "charge", "chargee", "premier", "garde", "seaux",
]);
export function rattachementDe(m: MandatMinistre, duGouvernement: MandatMinistre[]): MandatMinistre | null {
  const f = normaliseNom(m.fonction + " " + (m.portefeuille ?? ""));
  const i = f.indexOf("aupres de");
  if (i === -1) return null;
  const segment = f.slice(i);
  if (segment.includes("premier ministre")) {
    const pm = duGouvernement.find((x) => x.id !== m.id && ordreRang(x.rang) === 0 && !x.fin);
    if (pm) return pm;
  }
  let meilleur: MandatMinistre | null = null;
  let score = 0;
  for (const c of duGouvernement) {
    if (c.id === m.id || ordreRang(c.rang) > 2) continue;
    const cible = normaliseNom((c.portefeuille ?? "") + " " + c.fonction);
    const mots = cible.split(" ").filter((w) => w.length > 3 && !MOTS_VIDES_RATTACHEMENT.has(w));
    const s = mots.filter((w) => segment.includes(w)).length;
    if (s > score) { score = s; meilleur = c; }
  }
  return score > 0 ? meilleur : null;
}
