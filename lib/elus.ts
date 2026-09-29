import "server-only";
import { dataQuery, referentiel, type Elu, type Mouvement, COLONNES_PUBLIQUES } from "./data";
import { slugSenat } from "./format";

// Retrouve un élu à partir de l'identifiant d'URL :
// PA… (AN), slug senat.fr ou matricule (Sénat), identifiant numérique (PE).
export async function eluDepuisId(id: string): Promise<Elu | null> {
  const elus = await referentiel();
  const low = id.toLowerCase();
  return (
    elus.find((e) => e.chambre === "assemblee" && e.id.toLowerCase() === low) ??
    elus.find((e) => e.chambre === "senat" && (slugSenat(e.nom, e.id) === low || e.id.toLowerCase() === low)) ??
    elus.find((e) => e.chambre === "europarl" && e.id === id) ??
    null
  );
}

export function lienOfficiel(e: Elu): string | null {
  if (e.chambre === "assemblee") return `https://www.assemblee-nationale.fr/dyn/deputes/${e.id}`;
  if (e.chambre === "senat") return e.id ? `https://www.senat.fr/senateur/${slugSenat(e.nom, e.id)}.html` : null;
  if (e.chambre === "europarl") return `https://www.europarl.europa.eu/meps/fr/${e.id}`;
  return null;
}

export async function equipe(e: Elu) {
  const p = new URLSearchParams({
    select: "collab_nom,collab_prenom,collab_civilite,fonction,statut",
    chambre: `eq.${e.chambre}`, elu_cle: `eq.${e.cle}`, order: "collab_nom", limit: "200",
  });
  return (await dataQuery<{ collab_nom: string; collab_prenom: string; collab_civilite: string; fonction: string; statut: string }>("affectations", p, 3600)).rows;
}

export async function mouvementsElu(e: Elu, limit = 5) {
  const p = new URLSearchParams({
    select: COLONNES_PUBLIQUES, chambre: `eq.${e.chambre}`,
    or: `(elu_cle.eq."${e.cle}",elu_origine_cle.eq."${e.cle}")`,
    order: "date_event.desc", limit: String(limit),
  });
  return (await dataQuery<Mouvement>("mouvements", p, 3600)).rows;
}
