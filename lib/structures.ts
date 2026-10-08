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
    fonction: "eq." + fonction,
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
    collab_cle: "eq." + cle,
    order: "date_event.desc,id.asc",
    limit: "100",
  });
  return (await dataQuery<Mouvement>("mouvements", p, 3600)).rows;
}

// ── Enrichissement SIREN (Pappers API v2) ───────────────────────────────────
// La clé est facultative : sans PAPPERS_API_KEY les pages fonctionnent,
// simplement sans les détails d'identification. Les réponses sont mises
// en cache serveur 24 h par Next.
//
// Méthode : /recherche?q=<nom> pour trouver le SIREN (la dénomination PE
// peut différer de la raison sociale — recherche Pappers « standard »),
// puis /entreprise?siren=… pour la fiche complète (forme juridique,
// dirigeants, bénéficiaires effectifs, siège, statut consolidé).
// Un seul résultat actif est requis pour l'appariement automatique :
// plusieurs résultats → non identifiée (à valider à la main).
//
// Les SIREN validés à la main (SIREN_MANUELS) court-circuitent la
// recherche : ils s'affichent même sans clé API, la clé ne servant
// qu'à compléter la fiche (dirigeants, bénéficiaires, adresse).

// SIREN validés à la main par DataParl' (dénomination Parlement européen
// → registre national), saisis par slug de structure (cf. slugStructure).
const SIREN_MANUELS: Record<string, string> = {
  "sarl-as-c-accompagnement-service-point-conseil": "484780101",
  "signat-s": "520219304",
  "sas-limongi-conseil": "521378273",
  "expertelia-ouest-conseil": "508712619",
};

export type InfoSiren = {
  siren: string;
  forme_juridique: string;
  denomination: string;
  actif: boolean;
  dirigeants: string[];
  beneficiaires: string[];
  adresse: string;
  code_naf: string;
  domaine_activite: string;
  manuel: boolean;
};

// Extraction d'une fiche Pappers vers InfoSiren.
function versInfo(fiche: Record<string, unknown>, nom: string, manuel: boolean): InfoSiren {
  const siege = (fiche.siege ?? {}) as Record<string, unknown>;
  const nomsPropres = (cle: string) =>
    Array.isArray(fiche[cle])
      ? (fiche[cle] as Record<string, unknown>[])
          .slice(0, 6)
          .map((x) => {
            const n = String(x.nom ?? "").trim();
            const p = String(x.prenom ?? "").trim();
            return [p, n].filter(Boolean).join(" ");
          })
          .filter(Boolean)
      : [];
  const adresse = [String(siege.adresse_ligne_1 ?? ""), String(siege.code_postal ?? ""), String(siege.ville ?? "")]
    .filter(Boolean)
    .join(" ");
  return {
    siren: String(fiche.siren ?? ""),
    denomination: String(fiche.nom_entreprise ?? fiche.denomination ?? nom),
    forme_juridique: String(fiche.forme_juridique ?? ""),
    actif: String(fiche.statut_consolide ?? "").toLowerCase() === "actif",
    dirigeants: nomsPropres("representants"),
    beneficiaires: nomsPropres("beneficiaires_effectifs"),
    adresse,
    code_naf: String(fiche.code_naf ?? ""),
    domaine_activite: String(fiche.domaine_activite ?? ""),
    manuel,
  };
}

async function pappersFetch(path: string, params: Record<string, string>) {
  const token = process.env.PAPPERS_API_KEY;
  if (!token) return null;
  const url = new URL("https://api.pappers.fr/v2" + path);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  try {
    const r = await fetch(url, { headers: { "api-key": token }, next: { revalidate: 86400 } });
    if (!r.ok) return null;
    return (await r.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function pappers(nom: string): Promise<InfoSiren | null> {
  if (!nom) return null;
  // 0. SIREN validé à la main : fiche complète si clé API, sinon SIREN seul.
  const sirenManuel = SIREN_MANUELS[slugStructure(nom)];
  if (sirenManuel) {
    const fiche = await pappersFetch("/entreprise", { siren: sirenManuel });
    if (fiche && fiche.siren) return versInfo(fiche, nom, true);
    return {
      siren: sirenManuel,
      denomination: nom,
      forme_juridique: "",
      actif: true,
      dirigeants: [],
      beneficiaires: [],
      adresse: "",
      code_naf: "",
      domaine_activite: "",
      manuel: true,
    };
  }
  // 1. Recherche par dénomination : on veut un résultat non cessé.
  const recherche = await pappersFetch("/recherche", { q: nom, par_page: "5" });
  if (!recherche || !Array.isArray(recherche.resultats) || recherche.resultats.length === 0) return null;
  const resultats = recherche.resultats as Record<string, unknown>[];
  const actifs = resultats.filter((x) => !x.entreprise_cessee);
  // Appariement prudent : exactement une société active → identifiée ;
  // plusieurs → ambigu, on laisse « non identifiée » (validation manuelle).
  if (actifs.length !== 1) return null;
  const siren = String(actifs[0].siren ?? "");
  if (!siren) return null;
  // 2. Fiche complète.
  const fiche = await pappersFetch("/entreprise", { siren });
  if (!fiche || !fiche.siren) return null;
  return versInfo(fiche, nom, false);
}
