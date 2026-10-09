import "server-only";
import { dataQueryTout } from "./data";
import type { EluCollectif } from "./collectifsData";
import { libelleMandature, mandatureDuMandat, SCRUTINS_SENAT, serieDuSiege, slugMandature } from "./mandatures";

// Données des pages « groupes par mandature » (/groupe/an/xvii, /groupe/pe/10e,
// /groupe/senat/serie-1 et, par groupe, /groupe/pe-renew/10e…) et des pages
// « par scrutin de renouvellement » du Sénat (/groupe/senat/serie-1/2023).
// Législatures (AN, Parlement européen), séries et scrutins (Sénat), déduits
// des mandats réellement enregistrés : une page n'existe que si au moins un
// élu y est rattaché (« jusqu'où on a les valeurs »).

export type MandatureExistante = { chambre: string; valeur: number; slug: string; libelle: string; elus: number };
export type ScrutinExistant = { serie: 1 | 2; annee: number; elus: number };

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

// Scrutins sénatoriaux ayant des élus enregistrés : une page par scrutin
// (série × année d'élection). Seules les années de scrutins réels sont
// retenues (SCRUTINS_SENAT) — une élection partielle hors cycle ne crée
// pas de page.
export async function scrutinsExistants(): Promise<ScrutinExistant[]> {
  const mandats = await dataQueryTout<{ debut: string; personne_id: string }>("mandats",
    new URLSearchParams({ select: "debut,personne_id", chambre: "eq.senat", order: "debut" }), 3600);
  const vus = new Map<string, { serie: 1 | 2; annee: number; elus: Set<string> }>();
  for (const mandat of mandats) {
    const serie = serieDuSiege(mandat.debut);
    const annee = Number((mandat.debut ?? "").slice(0, 4));
    if (!serie || !Number.isInteger(annee) || !mandat.personne_id) continue;
    if (!SCRUTINS_SENAT.some((s) => s.serie === serie && s.annee === annee)) continue;
    const cle = serie + "|" + String(annee);
    let entree = vus.get(cle);
    if (!entree) { entree = { serie, annee, elus: new Set<string>() }; vus.set(cle, entree); }
    entree.elus.add(mandat.personne_id);
  }
  return [...vus.values()]
    .map((e) => ({ serie: e.serie, annee: e.annee, elus: e.elus.size }))
    .sort((a, b) => b.annee - a.annee);
}

export type EluMandature = EluCollectif & { sigleEpoque: string; groupeLibelleEpoque: string };

// Chevauchement de deux périodes AAAA-MM-JJ (fin vide = en cours).
function chevauche(aDebut: string, aFin: string, mDebut: string, mFin: string): boolean {
  return (!mDebut || aDebut <= (mFin || "9999-12-31")) && (!aFin || !mDebut || aFin >= mDebut);
}

type Appartenance = { sigle: string; libelle: string; debut: string; fin: string };
type Contexte = { fichesParId: Map<string, EluCollectif>; groupesParElu: Map<string, Appartenance[]> };

// Contexte d'une chambre : fiches des parlementaires et appartenances de
// groupe, partagé par les pages mandature et scrutin. Si la base qualifie
// les types, on ne garde que les groupes parlementaires.
async function contexteChambre(chambre: string): Promise<Contexte> {
  const [fiches, appartenances] = await Promise.all([
    dataQueryTout<EluCollectif>("parlementaires",
      new URLSearchParams({ select: COLS, chambre: "eq." + chambre, order: "nom,prenom" }), 3600),
    dataQueryTout<{ personne_id: string; type: string; sigle: string; libelle: string; debut: string; fin: string }>("appartenances",
      new URLSearchParams({ select: "personne_id,type,sigle,libelle,debut,fin", chambre: "eq." + chambre, order: "debut" }), 3600),
  ]);
  const fichesParId = new Map<string, EluCollectif>();
  for (const f of fiches) fichesParId.set(f.personne_id, f);
  const typesGroupe = appartenances.some((a) => /groupe/i.test(a.type ?? ""));
  const groupesParElu = new Map<string, Appartenance[]>();
  for (const a of appartenances) {
    if (!a.sigle || a.sigle === "Aucun" || (typesGroupe && !/groupe/i.test(a.type ?? ""))) continue;
    let liste = groupesParElu.get(a.personne_id);
    if (!liste) { liste = []; groupesParElu.set(a.personne_id, liste); }
    liste.push({ sigle: a.sigle, libelle: a.libelle, debut: (a.debut ?? "").slice(0, 10), fin: (a.fin ?? "").slice(0, 10) });
  }
  return { fichesParId, groupesParElu };
}

// Élu avec le groupe de l'époque : l'appartenance la plus récente chevauchant
// le mandat — fiches actives comme anciennes.
function eluDEpoque(ctx: Contexte, personneId: string, mDebut: string, mFin: string): EluMandature | null {
  const fiche = ctx.fichesParId.get(personneId);
  if (!fiche) return null;
  const groupe = (ctx.groupesParElu.get(personneId) ?? [])
    .filter((a) => chevauche(a.debut, a.fin, mDebut, mFin))
    .sort((a, b) => b.debut.localeCompare(a.debut))[0];
  return { ...fiche, sigleEpoque: groupe?.sigle ?? "", groupeLibelleEpoque: groupe?.libelle ?? "" };
}

async function mandatsChambre(chambre: string) {
  return dataQueryTout<{ personne_id: string; legislature: string | null; debut: string; fin: string }>("mandats",
    new URLSearchParams({ select: "personne_id,legislature,debut,fin", chambre: "eq." + chambre, order: "debut" }), 3600);
}

// Élus ayant siégé pendant une mandature (législature ou série), avec le
// groupe de l'époque.
export async function elusDeMandature(chambre: string, valeur: number): Promise<EluMandature[]> {
  const [mandats, ctx] = await Promise.all([mandatsChambre(chambre), contexteChambre(chambre)]);
  const out: EluMandature[] = [];
  const vus = new Set<string>();
  for (const mandat of mandats) {
    const valeurMandat = chambre === "senat" ? serieDuSiege(mandat.debut) : mandatureDuMandat(chambre, mandat.legislature, mandat.debut);
    if (valeurMandat !== valeur || !mandat.personne_id || vus.has(mandat.personne_id)) continue;
    const e = eluDEpoque(ctx, mandat.personne_id, (mandat.debut ?? "").slice(0, 10), (mandat.fin ?? "").slice(0, 10));
    if (!e) continue;
    vus.add(mandat.personne_id);
    out.push(e);
  }
  return out.sort((a, b) => (a.nom + a.prenom).localeCompare(b.nom + b.prenom, "fr"));
}

// Sénateurs élus lors d'un scrutin (série × année d'élection), avec le groupe
// de l'époque : la cohorte du scrutin, pas toute la série.
export async function elusDuScrutin(serie: 1 | 2, annee: number): Promise<EluMandature[]> {
  const [mandats, ctx] = await Promise.all([mandatsChambre("senat"), contexteChambre("senat")]);
  const out: EluMandature[] = [];
  const vus = new Set<string>();
  for (const mandat of mandats) {
    if (serieDuSiege(mandat.debut) !== serie) continue;
    if ((mandat.debut ?? "").slice(0, 4) !== String(annee)) continue;
    if (!mandat.personne_id || vus.has(mandat.personne_id)) continue;
    const e = eluDEpoque(ctx, mandat.personne_id, (mandat.debut ?? "").slice(0, 10), (mandat.fin ?? "").slice(0, 10));
    if (!e) continue;
    vus.add(mandat.personne_id);
    out.push(e);
  }
  return out.sort((a, b) => (a.nom + a.prenom).localeCompare(b.nom + b.prenom, "fr"));
}
