import "server-only";
import { dataQueryTout } from "./data";
import type { EluCollectif } from "./collectifsData";
import { libelleMandature, mandatureDuMandat, serieDuSiege, slugMandature } from "./mandatures";

// Données des pages « groupes par mandature » (/groupe/an/xvii, /groupe/pe/10e,
// /groupe/senat/serie-1 et, par groupe, /groupe/pe-renew/10e…). Législatures
// (AN, Parlement européen) et séries de renouvellement (Sénat), déduites des
// mandats réellement enregistrés : une mandature n'a de page que si au moins
// un élu y a siégé (« jusqu'où on a les valeurs »).

export type MandatureExistante = { chambre: string; valeur: number; slug: string; libelle: string; elus: number };

const COLS = "chambre,personne_id,slug,civilite,prenom,nom,groupe,groupe_libelle,circonscription,departement,photo_url,actif";

// Mandatures suivies, par chambre, avec le nombre d'élus distincts.
export async function mandaturesExistantes(): Promise<MandatureExistante[]> {
  const mandats = await dataQueryTout<{ chambre: string; legislature: string | null; debut: string; personne_id: string }>(
    "mandats", new URLSearchParams({ select: "chambre,legislature,debut,personne_id", order: "chambre,debut" }), 3600);
  const vus = new Map<string, { chambre: string; valeur: number; elus: Set<string> }>();
  for (const mandat of mandats) {
    const valeur = mandat.chambre === "senat" ? serieDuSiege(mandat.debut) : mandatureDuMandat(mandat.chambre, mandat.legislature, mandat.debut);
    if (valeur === null) continue;
    const cle = mandat.chambre + "|" + String(valeur);
    let entree = vus.get(cle);
    if (!entree) { entree = { chambre: mandat.chambre, valeur, elus: new Set<string>() }; vus.set(cle, entree); }
    if (mandat.personne_id) entree.elus.add(mandat.personne_id);
  }
  const out: MandatureExistante[] = [];
  for (const e of vus.values()) {
    const slug = slugMandature(e.chambre, e.valeur);
    const libelle = libelleMandature(e.chambre, e.valeur);
    if (!slug || !libelle) continue;
    out.push({ chambre: e.chambre, valeur: e.valeur, slug, libelle, elus: e.elus.size });
  }
  return out.sort((a, b) => a.chambre.localeCompare(b.chambre) || b.valeur - a.valeur);
}

export type EluMandature = EluCollectif & { sigleEpoque: string; groupeLibelleEpoque: string };

// Chevauchement de deux périodes AAAA-MM-JJ (fin vide = en cours).
function chevauche(aDebut: string, aFin: string, mDebut: string, mFin: string): boolean {
  return (!mDebut || aDebut <= (mFin || "9999-12-31")) && (!aFin || !mDebut || aFin >= mDebut);
}

// Élus ayant siégé pendant une mandature, avec le groupe de l'époque
// (l'appartenance la plus récente chevauchant le mandat) — fiches actives
// comme anciennes : une page par mandature, pas seulement en cours.
export async function elusDeMandature(chambre: string, valeur: number): Promise<EluMandature[]> {
  const [mandats, fiches, appartenances] = await Promise.all([
    dataQueryTout<{ personne_id: string; legislature: string | null; debut: string; fin: string }>("mandats",
      new URLSearchParams({ select: "personne_id,legislature,debut,fin", chambre: "eq." + chambre, order: "debut" }), 3600),
    dataQueryTout<EluCollectif>("parlementaires",
      new URLSearchParams({ select: COLS, chambre: "eq." + chambre, order: "nom,prenom" }), 3600),
    dataQueryTout<{ personne_id: string; type: string; sigle: string; libelle: string; debut: string; fin: string }>("appartenances",
      new URLSearchParams({ select: "personne_id,type,sigle,libelle,debut,fin", chambre: "eq." + chambre, order: "debut" }), 3600),
  ]);
  const fichesParId = new Map<string, EluCollectif>();
  for (const f of fiches) fichesParId.set(f.personne_id, f);
  // Appartenances de groupe : sigle rempli ; si la base qualifie les types,
  // on ne garde que les groupes parlementaires.
  const typesGroupe = appartenances.some((a) => /groupe/i.test(a.type ?? ""));
  const groupesParElu = new Map<string, { sigle: string; libelle: string; debut: string; fin: string }[]>();
  for (const a of appartenances) {
    if (!a.sigle || a.sigle === "Aucun" || (typesGroupe && !/groupe/i.test(a.type ?? ""))) continue;
    let liste = groupesParElu.get(a.personne_id);
    if (!liste) { liste = []; groupesParElu.set(a.personne_id, liste); }
    liste.push({ sigle: a.sigle, libelle: a.libelle, debut: (a.debut ?? "").slice(0, 10), fin: (a.fin ?? "").slice(0, 10) });
  }
  const out: EluMandature[] = [];
  const vus = new Set<string>();
  for (const mandat of mandats) {
    const valeurMandat = chambre === "senat" ? serieDuSiege(mandat.debut) : mandatureDuMandat(chambre, mandat.legislature, mandat.debut);
    if (valeurMandat !== valeur || !mandat.personne_id || vus.has(mandat.personne_id)) continue;
    const fiche = fichesParId.get(mandat.personne_id);
    if (!fiche) continue;
    vus.add(mandat.personne_id);
    const groupe = (groupesParElu.get(mandat.personne_id) ?? [])
      .filter((a) => chevauche(a.debut, a.fin, (mandat.debut ?? "").slice(0, 10), (mandat.fin ?? "").slice(0, 10)))
      .sort((a, b) => b.debut.localeCompare(a.debut))[0];
    out.push({ ...fiche, sigleEpoque: groupe?.sigle ?? "", groupeLibelleEpoque: groupe?.libelle ?? "" });
  }
  return out.sort((a, b) => (a.nom + a.prenom).localeCompare(b.nom + b.prenom, "fr"));
}