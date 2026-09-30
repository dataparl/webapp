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

// Un élu des données : par sa clé (AN : PA ; Sénat : clé du nom) ou son identifiant.
export function filtreElu(e: Pick<Elu, "cle" | "id">): string {
  return `(elu_cle.eq."${e.cle}"${e.id ? `,elu_id.eq."${e.id}"` : ""})`;
}

// Élu des données de collaborateurs correspondant à une fiche du référentiel.
export function eluDepuisFiche(f: { chambre: Elu["chambre"]; elu_id: string; cle: string; prenom: string; nom: string; groupe: string }): Elu {
  return { chambre: f.chambre, cle: f.chambre === "assemblee" ? f.elu_id : f.cle, id: f.elu_id, nom: `${f.prenom} ${f.nom}`, groupe: f.groupe, n_collabs: 0 };
}

export function lienOfficiel(e: Elu): string | null {
  if (e.chambre === "assemblee") return `https://www.assemblee-nationale.fr/dyn/deputes/${e.id}`;
  if (e.chambre === "senat") return e.id ? `https://www.senat.fr/senateur/${slugSenat(e.nom, e.id)}.html` : null;
  if (e.chambre === "europarl") return `https://www.europarl.europa.eu/meps/fr/${e.id}`;
  return null;
}

export async function equipe(e: Elu) {
  const p = new URLSearchParams({
    select: "collab_cle,collab_nom,collab_prenom,collab_civilite,fonction,statut",
    chambre: `eq.${e.chambre}`, or: filtreElu(e), order: "collab_nom", limit: "200",
  });
  return (await dataQuery<{ collab_cle: string; collab_nom: string; collab_prenom: string; collab_civilite: string; fonction: string; statut: string }>("affectations", p, 3600)).rows;
}

export async function mouvementsElu(e: Elu, limit = 5) {
  const p = new URLSearchParams({
    select: COLONNES_PUBLIQUES, chambre: `eq.${e.chambre}`,
    or: `(elu_cle.eq."${e.cle}",elu_origine_cle.eq."${e.cle}"${e.id ? `,elu_id.eq."${e.id}",elu_origine_id.eq."${e.id}"` : ""})`,
    order: "date_event.desc", limit: String(limit),
  });
  return (await dataQuery<Mouvement>("mouvements", p, 3600)).rows;
}

export async function statsElu(e: Elu) {
  const p = new URLSearchParams({ select: "*", chambre: `eq.${e.chambre}`, or: filtreElu(e), limit: "1" });
  const { rows } = await dataQuery<import("./stats").StatElu>("stats_turnover_elus", p, 3600);
  return rows[0] ?? null;
}
