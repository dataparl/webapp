import "server-only";
import { dataQuery, dataQueryTout } from "./data";
import { slugGouvernement } from "./gouvernementTypes";
import type { MandatMinistre, MembreCabinet } from "./gouvernementTypes";

// Lecture des mandats ministériels et des membres de cabinets (base dataparl, RLS : select ouvert).

export const COLONNES_MANDATS = "id,prenom,nom,fonction,portefeuille,gouvernement,debut,fin,rang,civilite,personne_id,infogouv_slug";
export const COLONNES_CABINETS = "id,ministre_id,collab_cle,collab_prenom,collab_nom,fonction,debut,fin,collab_id";

export async function mandatsEtCabinets(): Promise<{ mandats: MandatMinistre[]; cabinets: MembreCabinet[] }> {
  const mandats = await dataQueryTout<MandatMinistre>("ministres", new URLSearchParams({ select: COLONNES_MANDATS, order: "debut.desc" }));
  const cabinets = await dataQueryTout<MembreCabinet>("cabinets_ministeriels", new URLSearchParams({ select: COLONNES_CABINETS, order: "debut.asc" }));
  return { mandats, cabinets };
}

export async function ficheMinistre(id: string): Promise<MandatMinistre | null> {
  const { rows } = await dataQuery<MandatMinistre>("ministres", new URLSearchParams({ select: COLONNES_MANDATS, id: "eq." + id, limit: "1" }));
  return rows[0] ?? null;
}

export async function cabinetsDuMinistre(ministreId: string): Promise<MembreCabinet[]> {
  return (await dataQuery<MembreCabinet>("cabinets_ministeriels", new URLSearchParams({ select: COLONNES_CABINETS, ministre_id: "eq." + ministreId, order: "debut.asc" }))).rows;
}

// Postes en cabinet ministériel d'une personne déjà recensée comme
// collaborateur parlementaire (rapprochement par collab_id) : c'est la même
// fiche qui réunit les deux parcours (/collab/<slug>).
export async function cabinetsDeCollab(collabIds: string[]): Promise<MembreCabinet[]> {
  const ids = [...new Set(collabIds.filter(Boolean))];
  if (!ids.length) return [];
  return (await dataQuery<MembreCabinet>("cabinets_ministeriels", new URLSearchParams({ select: COLONNES_CABINETS, collab_id: "in.(" + ids.join(",") + ")", order: "debut.asc" }))).rows;
}

// Tous les mandats d'une même personne (personne_id est rarement renseigné : rapprochement par le nom).
export async function autresMandats(m: MandatMinistre): Promise<MandatMinistre[]> {
  return (await dataQuery<MandatMinistre>("ministres", new URLSearchParams({ select: COLONNES_MANDATS, prenom: "eq." + m.prenom, nom: "eq." + m.nom, order: "debut.asc" }))).rows;
}

export async function parcoursCabinet(cle: string): Promise<MembreCabinet[]> {
  return (await dataQuery<MembreCabinet>("cabinets_ministeriels", new URLSearchParams({ select: COLONNES_CABINETS, collab_cle: "eq." + cle, order: "debut.asc" }))).rows;
}

export async function ministresParIds(ids: string[]): Promise<MandatMinistre[]> {
  if (!ids.length) return [];
  const liste = ids.map((i) => '"' + i.replace(/"/g, "") + '"').join(",");
  return (await dataQuery<MandatMinistre>("ministres", new URLSearchParams({ select: COLONNES_MANDATS, id: "in.(" + liste + ")", order: "debut.asc" }))).rows;
}

// Date du dernier relevé JORF traité par le balayage quotidien.
export async function dernierReleve(): Promise<string | null> {
  const { rows } = await dataQuery<{ date_jorf: string }>("jorf_releves", new URLSearchParams({ select: "date_jorf", order: "date_jorf.desc", limit: "1" }), 3600);
  return rows[0]?.date_jorf ?? null;
}

// Fiche parlementaire d'un ministre (la fiche active d'abord, sinon l'ancienne).
export type FicheParlementaire = { chambre: string; slug: string; prenom: string; nom: string; actif: boolean };
export async function ficheParlementaireDe(personneId: string | null): Promise<FicheParlementaire | null> {
  if (!personneId) return null;
  const cols = "chambre,slug,prenom,nom,actif";
  const actives = await dataQuery<FicheParlementaire>("parlementaires", new URLSearchParams({ select: cols, personne_id: "eq." + personneId, actif: "eq.true", limit: "1" }), 3600).catch(() => ({ rows: [] as FicheParlementaire[] }));
  if (actives.rows[0]) return actives.rows[0];
  const toutes = await dataQuery<FicheParlementaire>("parlementaires", new URLSearchParams({ select: cols, personne_id: "eq." + personneId, limit: "1" }), 3600).catch(() => ({ rows: [] as FicheParlementaire[] }));
  return toutes.rows[0] ?? null;
}

// ── Gouvernements ──────────────────────────────────────────────────────────
// Gouvernements connus (mandats groupés par nom), du plus récent au plus ancien.
// fin = null tant qu'un mandat est en cours (gouvernement en exercice).
export type Gouvernement = { nom: string; slug: string; debut: string; fin: string | null };
export function listeGouvernements(mandats: MandatMinistre[]): Gouvernement[] {
  const parNom = new Map<string, { debut: string; fin: string | null }>();
  for (const m of mandats) {
    if (!m.gouvernement) continue;
    const e = parNom.get(m.gouvernement) ?? { debut: m.debut, fin: m.fin };
    if (m.debut < e.debut) e.debut = m.debut;
    if (!m.fin) e.fin = null;
    else if (e.fin !== null && m.fin > e.fin) e.fin = m.fin;
    parNom.set(m.gouvernement, e);
  }
  return [...parNom.entries()]
    .map(([nom, e]) => ({ nom, slug: slugGouvernement(nom), debut: e.debut, fin: e.fin }))
    .sort((a, b) => b.debut.localeCompare(a.debut));
}

// Photos officielles des ministres ayant été parlementaires (servies par
// media.dataparl.fr) : rapprochement par personne_id, première fiche avec photo.
export type PhotoMinistre = { chambre: string; slug: string; photo_url: string };
export async function photosDesPersonnes(personneIds: string[]): Promise<Map<string, PhotoMinistre>> {
  const ids = [...new Set(personneIds.filter(Boolean))].slice(0, 200);
  const out = new Map<string, PhotoMinistre>();
  if (!ids.length) return out;
  const liste = ids.map((i) => '"' + i.replace(/"/g, "") + '"').join(",");
  const { rows } = await dataQuery<PhotoMinistre & { personne_id: string }>("parlementaires", new URLSearchParams({ select: "personne_id,chambre,slug,photo_url", personne_id: "in.(" + liste + ")", limit: "500" }));
  for (const r of rows) if (r.photo_url && !out.has(r.personne_id)) out.set(r.personne_id, { chambre: r.chambre, slug: r.slug, photo_url: r.photo_url });
  return out;
}

// Photo d'un ministre : portrait officiel du Gouvernement (info.gouv.fr,
// servi par media.dataparl.fr/gouv/…) quand la personnalité y est recensée,
// sinon photo parlementaire historique.
export function photoMinistreDe(m: MandatMinistre, photos: Map<string, PhotoMinistre>): PhotoMinistre | undefined {
  if (m.infogouv_slug) {
    return { chambre: "gouvernement", slug: m.infogouv_slug, photo_url: "https://www.info.gouv.fr/personnalite/" + m.infogouv_slug };
  }
  return m.personne_id ? photos.get(m.personne_id) : undefined;
}
