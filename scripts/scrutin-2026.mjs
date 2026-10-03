#!/usr/bin/env node
// Génère lib/scrutin2026Officiel.ts depuis la liste officielle des élus
// publiée par le ministère de l'Intérieur (résultats des sénatoriales 2026).
// À relancer après toute mise à jour de la page officielle :
//   node scripts/scrutin-2026.mjs

const URL_OFFICIELLE = "https://www.resultats-elections.interieur.gouv.fr/Senatoriales2026/nouvelle_assemblee/index.html";
const SORTIE = new URL("../lib/scrutin2026Officiel.ts", import.meta.url);

const r = await fetch(URL_OFFICIELLE, { headers: { "User-Agent": "DataParl' (https://www.dataparl.fr; contact@dataparl.fr)" } });
if (!r.ok) throw new Error(`HTTP ${r.status}`);
const html = await r.text();
const texte = (x) =>
  x.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&#39;|&rsquo;/g, "'")
   .replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

const lignes = [...html.matchAll(/<tr[^>]*>(.*?)<\/tr>/gs)].map((m) => m[1]);
const elus = [];
for (const l of lignes) {
  const cellules = [...l.matchAll(/<t[dh][^>]*>(.*?)<\/t[dh]>/gs)].map((c) => texte(c[1]));
  if (cellules.length < 2 || cellules[0] === "Circonscriptions") continue;
  const [brutDept, brutNom, liste = ""] = cellules;
  const m = brutNom.match(/^(Mme|M\.)\s+(.+)$/);
  const civilite = m ? m[1] : "";
  const complet = (m ? m[2] : brutNom).trim();
  const parties = complet.split(/\s+/);
  const prenom = parties[0];
  const nom = parties.slice(1).join(" ") || prenom;
  const departement = brutDept.replace(/\s*\([A-Z0-9]{2,3}\)\s*$/, "").trim();
  elus.push({ complet, civilite, prenom, nom, departement, liste: liste.trim() });
}

const entete = `// Généré par scripts/scrutin-2026.mjs — ne pas éditer à la main.
// Source : ministère de l'Intérieur, résultats des sénatoriales 2026
// ${URL_OFFICIELLE}
// (${elus.length} élus, scrutin du 27 septembre 2026)

import type { EluOfficiel } from "./senatorialesClassement";

export const ELECTION_SCRUTIN_2026 = "2026-09-27" as const;
export const ELUS_OFFICIELS_2026: EluOfficiel[] = [
`;

const corps = elus
  .map((e) => `  { civilite: ${JSON.stringify(e.civilite)}, prenom: ${JSON.stringify(e.prenom)}, nom: ${JSON.stringify(e.nom)}, nom_complet: ${JSON.stringify(e.complet)}, departement: ${JSON.stringify(e.departement)}, liste: ${JSON.stringify(e.liste)} },`)
  .join("\n");

const fs = await import("node:fs");
fs.writeFileSync(SORTIE, entete + corps + "\n];\n");
console.log(`${elus.length} élus officiels écrits dans lib/scrutin2026Officiel.ts`);
