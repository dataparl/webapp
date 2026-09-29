// Mise en forme partagée (serveur et navigateur).

export type MouvementAffiche = {
  id: string; date_event: string; chambre: "assemblee" | "senat" | "europarl"; type: "arrivee" | "depart" | "transfert";
  collab_nom: string; collab_prenom: string; elu_nom: string; elu_groupe: string; elu_id: string; elu_cle: string;
  elu_origine_nom: string; elu_origine_groupe: string; fonction: string; contexte: string; source: string;
};

export const CHAMBRE: Record<string, string> = { assemblee: "Assemblée", senat: "Sénat", europarl: "Parlement européen" };
export const CHAMBRE_LONG: Record<string, string> = { assemblee: "Assemblée nationale", senat: "Sénat", europarl: "Parlement européen" };
export const TYPE: Record<string, string> = { arrivee: "Arrivée", depart: "Départ", transfert: "Transfert" };

export function phrase(m: MouvementAffiche): string {
  const qui = `${m.collab_prenom} ${m.collab_nom}`.trim();
  const elu = `${m.elu_nom}${m.elu_groupe ? ` (${m.elu_groupe})` : ""}`;
  if (m.type === "arrivee") return `${qui} rejoint l'équipe de ${elu}`;
  if (m.type === "depart") return `${qui} quitte l'équipe de ${elu}`;
  return `${qui} passe de l'équipe de ${m.elu_origine_nom} à celle de ${elu}`;
}

export function dateLongue(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(iso));
}

// Identifiant d'URL d'un élu : PA… (AN), slug senat.fr (Sénat), identifiant européen (PE).
export function idParlementaire(chambre: string, eluId: string, eluCle: string, eluNom: string): string {
  if (chambre === "senat") return slugSenat(eluNom, eluId) || eluCle;
  return eluId || eluCle;
}

// senat.fr : nom_prenom + matricule, en minuscules, sans accents, espaces et tirets -> _
// ex. « Yannick JADOT », 21093M -> jadot_yannick21093m
export function slugSenat(eluNom: string, matricule: string): string {
  if (!matricule) return "";
  const toks = eluNom.trim().split(/\s+/);
  const idx = toks.findIndex((t) => /\p{L}/u.test(t) && t === t.toUpperCase() && t.replace(/[^\p{L}]/gu, "").length >= 2);
  const prenom = idx > 0 ? toks.slice(0, idx).join(" ") : "";
  const nom = idx >= 0 ? toks.slice(idx).join(" ") : eluNom;
  const n = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/['’]/g, "").replace(/[\s-]+/g, "_").replace(/[^a-z0-9_]/g, "");
  return `${n(nom)}_${n(prenom)}${matricule.toLowerCase()}`;
}
