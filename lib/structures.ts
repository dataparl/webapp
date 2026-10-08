import "server-only";
import { dataQuery, dataQueryTout, COLONNES_PUBLIQUES, type Mouvement } from "./data";

// Structures du Parlement européen : tiers payants (paying agents) et
// prestataires de services spécialisés (service providers) — le plus
// souvent des sociétés, suivies comme n'importe quel collaborateur
// (affectations, mouvements) mais affichées ici en tant qu'entités.

export const FONCTIONS_STRUCTURES = {
  "Tiers payant": {
    slug: "tiers-payants",
    titre: "Tiers payants du Parlement européen",
    court: "tiers payants",
    definition:
      "Personnes physiques ou morales autorisées dans un État membre à gérer, à titre professionnel, les aspects fiscaux et de sécurité sociale des contrats conclus par les eurodéputés. Le plus souvent des sociétés de paie ou de gestion.",
  },
  "Prestataire de services spécialisé": {
    slug: "prestataires",
    titre: "Prestataires de services spécialisés du Parlement européen",
    court: "prestataires de services",
    definition:
      "Personnes physiques ou morales ayant conclu avec un eurodéputé un contrat de services ciblés, directement liés à l'exercice du mandat, régi par le droit national. Le plus souvent des sociétés de conseil, de communication ou de recherche.",
  },
} as const;

export type FonctionStructure = keyof typeof FONCTIONS_STRUCTURES;
export const estFonctionStructure = (f: string): f is FonctionStructure => f in FONCTIONS_STRUCTURES;

export type ClientStructure = { elu_id: string; elu_nom: string; elu_groupe: string };
export type Structure = { cle: string; nom: string; clients: ClientStructure[] };

export function slugStructure(nom: string): string {
  return nom
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/['’]/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// Toutes les structures d'une catégorie, avec leurs eurodéputés clients.
export async function structures(fonction: FonctionStructure): Promise<Structure[]> {
  const p = new URLSearchParams({
    select: "collab_cle,collab_nom,elu_id,elu_nom,elu_groupe",
    chambre: "eq.europarl",
    fonction: `eq.${fonction}`,
  });
  const rows = await dataQueryTout<{ collab_cle: string; collab_nom: string; elu_id: string; elu_nom: string; elu_groupe: string }>(
    "affectations", p, 3600,
  );
  const parCle = new Map<string, Structure>();
  for (const r of rows) {
    let s = parCle.get(r.collab_cle);
    if (!s) {
      s = { cle: r.collab_cle, nom: r.collab_nom || r.collab_cle, clients: [] };
      parCle.set(r.collab_cle, s);
    }
    if (!s.clients.some((c) => c.elu_id === r.elu_id)) {
      s.clients.push({ elu_id: r.elu_id, elu_nom: r.elu_nom, elu_groupe: r.elu_groupe });
    }
  }
  return [...parCle.values()].sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
}

export async function structureDepuisSlug(fonction: FonctionStructure, slug: string): Promise<Structure | null> {
  const toutes = await structures(fonction);
  return toutes.find((s) => slugStructure(s.nom) === slug) ?? null;
}

// Mouvements touchant une structure (arrivées / départs chez ses clients).
export async function mouvementsStructure(cle: string): Promise<Mouvement[]> {
  const p = new URLSearchParams({
    select: COLONNES_PUBLIQUES,
    chambre: "eq.europarl",
    collab_cle: `eq.${cle}`,
    order: "date_event.desc,id.asc",
    limit: "100",
  });
  return (await dataQuery<Mouvement>("mouvements", p, 3600)).rows;
}

// ── Enrichissement SIREN (Pappers) ─────────────────────────────────────────
// La clé est facultative : sans PAPPERS_API_KEY les pages fonctionnent,
// simplement sans les colonnes d'identification. Les réponses sont mises
// en cache serveur 24 h par Next.

export type InfoSiren = {
  siren: string;
  forme_juridique: string;
  denomination: string;
  actif: boolean;
  dirigeants: string[];
  adresse: string;
};

export async function pappers(nom: string): Promise<InfoSiren | null> {
  const token = process.env.PAPPERS_API_KEY;
  if (!token || !nom) return null;
  try {
    const url = `https://api.pappers.fr/v1/entreprise?nom_entreprise=${encodeURIComponent(nom)}&api_token=${token}`;
    const r = await fetch(url, { next: { revalidate: 86400 } });
    if (!r.ok) return null;
    const d = (await r.json()) as Record<string, unknown>;
    const siren = d.siren as string | undefined;
    if (!siren) return null;
    const siege = (d.siege ?? {}) as Record<string, unknown>;
    const dirigeants = Array.isArray(d.dirigeants)
      ? (d.dirigeants as Record<string, unknown>[]).slice(0, 5)
          .map((x) => String(x.nom_complet ?? x.nom ?? "").trim())
          .filter(Boolean)
      : [];
    const adresseL1 = String(siege.adresse_ligne_1 ?? "").trim();
    const adresse = [adresseL1, String(siege.code_postal ?? ""), String(siege.ville ?? "")].filter(Boolean).join(" ");
    return {
      siren,
      denomination: String(d.nom_entreprise ?? nom),
      forme_juridique: String(d.forme_juridique ?? ""),
      actif: String(d.etat ?? "").toUpperCase().includes("ACTIF"),
      dirigeants,
      adresse,
    };
  } catch {
    return null;
  }
}
