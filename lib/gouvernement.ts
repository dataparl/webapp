import "server-only";
import { dataQuery, dataQueryTout } from "./data";
import type { MandatMinistre, MembreCabinet } from "./gouvernementTypes";

// Lecture des mandats ministériels et des membres de cabinets (base dataparl, RLS : select ouvert).

export const COLONNES_MANDATS = "id,prenom,nom,fonction,portefeuille,gouvernement,debut,fin";
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

// Tous les mandats d’une même personne (personne_id est rarement renseigné : rapprochement par le nom).
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
