// Mandatures par chambre : législatures numérotées (Assemblée nationale,
// Parlement européen) et séries de renouvellement (Sénat, chambre permanente
// renouvelée par moitié tous les trois ans). Logique pure, sans
// « server-only », pour être testée hors Next.
//
// Adresses (minuscules, convention du site) :
//   /groupe/an/{xvii|xvi|xv|…}    ex. /groupe/an/xvii (XVIIe législature)
//   /groupe/pe/{10e|9e|…}         ex. /groupe/pe/10e (10e législature)
//   /groupe/senat/serie-{1|2}     ex. /groupe/senat/serie-1 (renouvelée en 2023)
//   /groupe/senat/serie-{1|2}/{annee}  ex. /groupe/senat/serie-1/2023 (scrutin de 2023)
//   et, par groupe : /groupe/pe-renew/10e, /groupe/an-rn/xvii, …
import { slugCollectif } from "./collectifs";

// Chiffres romains (14 → XIV), pour les législatures de l'Assemblée.
export function romain(n: number): string | null {
  if (!Number.isInteger(n) || n < 1 || n > 39) return null;
  const TABLE: [number, string][] = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let restant = n;
  let sortie = "";
  for (const [v, s] of TABLE) while (restant >= v) { sortie += s; restant -= v; }
  return sortie;
}

// Périodes canoniques des législatures — repères d'appartenance, affinées par
// les mandats réels. AN : XIV (2012-2017), XV (2017-2022), XVI (2022-2024,
// dissolution le 9 juin 2024), XVII (depuis juin 2024). PE : 9e (2019-2024),
// 10e (depuis 2024). Fin vide = mandature en cours.
export const PERIODES: Record<"assemblee" | "europarl", Record<number, [string, string]>> = {
  assemblee: { 14: ["2012-06-20", "2017-06-19"], 15: ["2017-06-20", "2022-06-21"], 16: ["2022-06-22", "2024-06-08"], 17: ["2024-06-09", ""] },
  europarl: { 9: ["2019-05-26", "2024-06-15"], 10: ["2024-06-16", ""] },
};

// Mandature d'un mandat : la colonne legislature quand elle est remplie,
// sinon la date de début (périodes canoniques). Null au Sénat : serieDuSiege.
export function mandatureDuMandat(chambre: string, legislature: string | null | undefined, debut: string): number | null {
  const n = Number(legislature);
  if (Number.isInteger(n) && n > 0) return n;
  if (chambre !== "assemblee" && chambre !== "europarl") return null;
  const d = (debut ?? "").slice(0, 10);
  if (!d) return null;
  for (const [num, periode] of Object.entries(PERIODES[chambre])) {
    if (d >= periode[0] && (periode[1] === "" || d <= periode[1])) return Number(num);
  }
  return null;
}

// Série du Sénat d'un siège, d'après la date d'élection du mandat (mandat de
// six ans, renouvelé à élection + 6) : la série 1 a été renouvelée en 2023
// (sièges élus en 2017 et 2023), la série 2 en 2020 puis en 2026 (sièges élus
// en 2014, 2020 et 2026). Les élections partielles hors cycle renvoient null.
export function serieDuSiege(debut: string): 1 | 2 | null {
  const annee = Number((debut ?? "").slice(0, 4));
  if (!Number.isInteger(annee) || annee < 2001 || annee > 2100) return null;
  const renouvellement = annee + 6;
  const ecart = (depuis: number) => (((renouvellement - depuis) % 6) + 6) % 6;
  if (ecart(2023) === 0) return 1;
  if (ecart(2020) === 0) return 2;
  return null;
}

// Slug d'URL d'une mandature : « xvii » (AN), « 10e » (PE), « serie-1 » (Sénat).
export function slugMandature(chambre: string, valeur: number): string | null {
  if (chambre === "assemblee") { const r = romain(valeur); return r ? r.toLowerCase() : null; }
  if (chambre === "europarl") return Number.isInteger(valeur) && valeur > 0 ? String(valeur) + "e" : null;
  if (chambre === "senat") return valeur === 1 || valeur === 2 ? "serie-" + String(valeur) : null;
  return null;
}

// Libellé long : « XVIIe législature », « 10e législature », « série 1 ».
export function libelleMandature(chambre: string, valeur: number): string | null {
  if (chambre === "assemblee") { const r = romain(valeur); return r ? r + "e législature" : null; }
  if (chambre === "europarl") return Number.isInteger(valeur) && valeur > 0 ? String(valeur) + "e législature" : null;
  if (chambre === "senat") return valeur === 1 ? "série 1" : valeur === 2 ? "série 2" : null;
  return null;
}

// Complément de libellé (renouvellements des séries du Sénat).
export const RENOUVELLEMENTS_SERIES: Record<number, string> = {
  1: "renouvelée en 2023 (sièges élus en 2017 et 2023)",
  2: "renouvelée en 2020 puis en 2026 (sièges élus en 2014, 2020 et 2026)",
};

// Scrutins sénatoriaux organisés depuis 2010 : date, série renouvelée et
// sièges renouvelés. Les pages /groupe/senat/serie-N/{annee} suivent ces
// scrutins — une page n'existe que si des mandats élus cette année-là sont
// réellement enregistrés (« jusqu'où on a les valeurs »).
export const SCRUTINS_SENAT: { serie: 1 | 2; annee: number; date: string; sieges: number }[] = [
  { serie: 1, annee: 2011, date: "25 septembre 2011", sieges: 170 },
  { serie: 2, annee: 2014, date: "28 septembre 2014", sieges: 178 },
  { serie: 1, annee: 2017, date: "24 septembre 2017", sieges: 170 },
  { serie: 2, annee: 2020, date: "27 septembre 2020", sieges: 178 },
  { serie: 1, annee: 2023, date: "24 septembre 2023", sieges: 170 },
  { serie: 2, annee: 2026, date: "27 septembre 2026", sieges: 178 },
];

// Inverse du slug : « xvii » → 17, « 10e » → 10, « serie-1 » → 1, « XVII » → 17.
export function mandatureDepuisSlug(chambre: string, slug: string): number | null {
  const s = (slug ?? "").toLowerCase();
  if (chambre === "europarl") { const m = /^(\d{1,2})e?$/.exec(s); return m ? Number(m[1]) : null; }
  if (chambre === "senat") { const m = /^serie-([12])$/.exec(s); return m ? Number(m[1]) : null; }
  if (chambre === "assemblee") {
    if (!/^[ivxlc]+$/.test(s)) return null;
    const VALEURS: Record<string, number> = { i: 1, v: 5, x: 10, l: 50, c: 100 };
    let total = 0;
    for (let i = 0; i < s.length; i++) {
      const v = VALEURS[s[i]] ?? 0;
      const suivant = VALEURS[s[i + 1]] ?? 0;
      total += v < suivant ? -v : v;
    }
    return total > 0 ? total : null;
  }
  return null;
}

// Harmonisation des renommages : le sigle d'hier rattaché à la fiche
// d'aujourd'hui. Ex. le FN devient le RN en 2018 : les élus du groupe FN
// des XIVe et XVe législatures figurent sur la fiche /groupe/an-rn/…
export const RENOMMAGES: Record<string, Record<string, string>> = {
  assemblee: { FN: "RN", UMP: "LR", LFI: "LFI-NFP", "LFI-NUPES": "LFI-NFP", "GDR-NUPES": "GDR" },
  senat: { UMP: "LR", CRCE: "CRCE-K" },
  europarl: { ALDE: "Renew", EF: "Patriots", ID: "Patriots" },
};

// Sigle actuel d'un groupe après harmonisation des renommages (ex. FN → RN).
export function harmoniserSigle(chambre: string, sigle: string): string {
  const table = RENOMMAGES[chambre] ?? {};
  let actuel = sigle;
  for (let i = 0; i < 5; i++) { const suivant = table[actuel]; if (!suivant) break; actuel = suivant; }
  return actuel;
}

// Sigles d'hier rattachés à un sigle actuel (ex. RN → [FN]).
export function anciensNoms(chambre: string, sigle: string): string[] {
  return Object.entries(RENOMMAGES[chambre] ?? {}).filter(([, actuel]) => actuel === sigle).map(([ancien]) => ancien);
}

// Retrouve le sigle actuel d'après un slug qui peut être un ancien nom
// (ex. « fn » → RN) : la fiche d'aujourd'hui, avec le nom d'hier.
export function sigleDepuisSlug(chambre: string, slug: string, actuels: readonly string[]): { actuel: string; ancien: string | null } | null {
  for (const a of actuels) if (slugCollectif(a) === slug) return { actuel: a, ancien: null };
  for (const [ancien, actuel] of Object.entries(RENOMMAGES[chambre] ?? {})) {
    if (slugCollectif(ancien) === slug) return { actuel, ancien };
  }
  return null;
}
