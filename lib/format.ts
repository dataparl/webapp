// Mise en forme partagée (serveur et navigateur).

export type MouvementAffiche = {
  id: string; date_event: string; chambre: "assemblee" | "senat" | "europarl"; type: "arrivee" | "depart" | "transfert";
  collab_nom: string; collab_prenom: string; collab_cle?: string; elu_nom: string; elu_groupe: string; elu_id: string; elu_cle: string;
  elu_origine_nom: string; elu_origine_groupe: string; fonction: string; contexte: string; source: string;
};

export const CHAMBRE: Record<string, string> = { assemblee: "Assemblée", senat: "Sénat", europarl: "Parlement européen" };
export const CHAMBRE_LONG: Record<string, string> = { assemblee: "Assemblée nationale", senat: "Sénat", europarl: "Parlement européen" };
export const TYPE: Record<string, string> = { arrivee: "Arrivée", depart: "Départ", transfert: "Transfert" };

export function phrase(m: MouvementAffiche): string {
  const qui = prenomNom(m.collab_prenom, m.collab_nom);
  const elu = `${nomAffiche(m.elu_nom)}${m.elu_groupe ? ` (${m.elu_groupe})` : ""}`;
  if (m.type === "arrivee") return `${qui} rejoint l'équipe de ${elu}`;
  if (m.type === "depart") return `${qui} quitte l'équipe de ${elu}`;
  return `${qui} passe de l'équipe de ${nomAffiche(m.elu_origine_nom)} à celle de ${elu}`;
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

// Clé de nom identique à celle du pipeline (collabs/normalize.py : cle) :
// minuscules, sans accents, ponctuation en espaces, tokens triés.
export function cleNom(...parts: string[]): string {
  const txt = parts.join(" ").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase()
    .replace(/[-'’`.]/g, " ").replace(/[^a-z0-9 ]/g, "");
  return txt.split(/\s+/).filter(Boolean).sort().join(" ");
}

// ── Noms : « Prénom NOM » partout ───────────────────────────────────────
const PARTICULES = new Set(["de", "du", "des", "d'", "d’", "del", "della"]);

function majuscules(nom: string): string {
  // Précision entre parenthèses (homonymes à l'AN : « Martin (Alpes-Maritimes) ») : casse d'origine.
  const m = nom.match(/^(.*?)\s*(\([^)]*\))\s*$/);
  if (m && m[1]) return `${majuscules(m[1])} ${m[2]}`;
  const toks = nom.trim().split(/\s+/).filter(Boolean);
  let i = 0;
  const out: string[] = [];
  while (i < toks.length - 1 && PARTICULES.has(toks[i].toLowerCase())) out.push(toks[i++].toLowerCase());
  for (; i < toks.length; i++) {
    const m = toks[i].match(/^(d['’])(.+)$/i);
    out.push(m ? m[1].toLowerCase() + m[2].toLocaleUpperCase("fr-FR") : toks[i].toLocaleUpperCase("fr-FR"));
  }
  return out.join(" ");
}

function prenomPropre(prenom: string): string {
  const p = prenom.trim();
  if (!p || p !== p.toLocaleUpperCase("fr-FR")) return p;
  return p.toLocaleLowerCase("fr-FR").replace(/(^|[\s-])(\p{L})/gu, (_, a, b) => a + b.toLocaleUpperCase("fr-FR"));
}

export function prenomNom(prenom: string, nom: string): string {
  return [prenomPropre(prenom ?? ""), majuscules(nom ?? "")].filter(Boolean).join(" ");
}

// Nom complet en une chaîne (« François Ruffin », « Corinne NARASSIGUIN »,
// « de LEGGE Dominique ») -> « Prénom NOM ».
export function nomAffiche(complet: string): string {
  const toks = (complet ?? "").trim().split(/\s+/).filter(Boolean);
  if (toks.length < 2) return complet ?? "";
  const estMaj = (t: string) => /\p{L}/u.test(t) && t === t.toLocaleUpperCase("fr-FR") && t.replace(/[^\p{L}]/gu, "").length >= 2;
  const iMaj = toks.findIndex(estMaj);
  if (iMaj === -1) return prenomNom(toks[0], toks.slice(1).join(" "));
  // NOM en tête (format Sénat « de LEGGE Dominique ») ou après le prénom.
  let debut = iMaj;
  while (debut > 0 && PARTICULES.has(toks[debut - 1].toLowerCase())) debut--;
  let fin = iMaj;
  while (fin + 1 < toks.length && (estMaj(toks[fin + 1]) || PARTICULES.has(toks[fin + 1].toLowerCase()))) fin++;
  const nom = toks.slice(debut, fin + 1).join(" ");
  const prenom = [...toks.slice(0, debut), ...toks.slice(fin + 1)].join(" ");
  return prenom ? prenomNom(prenom, nom) : majuscules(nom);
}
