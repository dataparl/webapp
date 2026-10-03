import { test } from "node:test";
import assert from "node:assert/strict";
import { SCRUTIN_2026, classerScrutin, debutEffectif, libelleElection, nomDepartement, nomNormalise, slugDepartement, type EluOfficiel, type FicheScrutin, type MandatScrutin } from "./senatorialesClassement.ts";

const fiche = (x: Partial<FicheScrutin>): FicheScrutin => ({
  personne_id: "", elu_id: "", slug: "", civilite: "M.", prenom: "", nom: "",
  actif: true, departement: "33 - Gironde", circonscription: "Gironde", groupe: "", groupe_libelle: "",
  photo_url: "", url_officielle: "", premier_mandat: "", ...x,
});
const mandat = (x: Partial<MandatScrutin>): MandatScrutin => ({
  personne_id: "", elu_id: "", debut: "", fin: "", libelle: "Sénateur", circonscription: "Gironde", cause_fin: "", ...x,
});

// Gironde réelle : Gillé réélu (mandats 2019 et 2020), Amouroux nouvelle
// avec un `debut` de mandat vide rattrapé par `premier_mandat`, Cazabonne sortant.
const fiches: FicheScrutin[] = [
  fiche({ personne_id: "S19820Y", elu_id: "19820Y", slug: "gille_herve19820y", civilite: "M.", prenom: "Hervé", nom: "Gillé", premier_mandat: "2019-08-28", actif: true }),
  fiche({ personne_id: "S21714T", elu_id: "21714T", slug: "amouroux_geraldine21714t", civilite: "Mme", prenom: "Géraldine", nom: "Amouroux", premier_mandat: "2026-10-01", actif: true }),
  fiche({ personne_id: "S21710P", elu_id: "21710P", slug: "bost_christine21710p", civilite: "Mme", prenom: "Christine", nom: "Bost", premier_mandat: "2026-10-01", actif: true }),
  fiche({ personne_id: "S19721W", elu_id: "19721W", slug: "cazabonne_alain19721w", civilite: "M.", prenom: "Alain", nom: "Cazabonne", premier_mandat: "2017-10-01", actif: false }),
];
const mandats: MandatScrutin[] = [
  mandat({ personne_id: "S19820Y", elu_id: "19820Y", debut: "2019-08-28", fin: "2020-09-30", cause_fin: "Fin de mandat" }),
  mandat({ personne_id: "S19820Y", elu_id: "19820Y", debut: "2020-10-01", fin: "2026-09-30", cause_fin: "Fin de mandat" }),
  mandat({ personne_id: "S19820Y", elu_id: "19820Y", debut: "2026-09-30", fin: "" }), // réélu au scrutin
  mandat({ personne_id: "S21714T", elu_id: "21714T", debut: "", fin: "" }), // scrutin, `debut` vide
  mandat({ personne_id: "S21710P", elu_id: "21710P", debut: "2026-09-30", fin: "" }), // scrutin, `debut` connu
  mandat({ personne_id: "S19721W", elu_id: "19721W", debut: "2017-10-01", fin: "2026-09-30", cause_fin: "Ne se représente pas" }),
];

test("scrutin : Gillé est réélu, pas nouveau", () => {
  const { nouveaux, reelus, sortants } = classerScrutin(fiches, mandats);
  assert.deepEqual(nouveaux.map((s) => s.nom).sort(), ["Amouroux", "Bost"]);
  assert.deepEqual(reelus.map((s) => s.nom), ["Gillé"]);
  assert.deepEqual(sortants.map((s) => s.nom), ["Cazabonne"]);
});

test("début effectif : mandat vide rattrapé par premier_mandat de la fiche", () => {
  const amouroux = fiches.find((f) => f.personne_id === "S21714T")!;
  const m = mandats.find((x) => x.personne_id === "S21714T")!;
  assert.equal(m.debut, "");
  assert.equal(debutEffectif(amouroux, m), "2026-10-01");
  const { nouveaux } = classerScrutin(fiches, mandats);
  const s = nouveaux.find((x) => x.personne_id === "S21714T")!;
  assert.equal(s.debut, "2026-10-01"); // affiché « élue en octobre 2026 »
});

test("mandat commencé avant le scrutin : ni nouveau ni sortant", () => {
  const fiches2 = [fiche({ personne_id: "S1", slug: "s1", prenom: "Alice", nom: "Martin", premier_mandat: "2025-03-15" })];
  const mandats2 = [mandat({ personne_id: "S1", debut: "2025-03-15", fin: "" })];
  const { nouveaux, reelus, sortants } = classerScrutin(fiches2, mandats2);
  assert.equal(nouveaux.length, 0);
  assert.equal(reelus.length, 0);
  assert.equal(sortants.length, 0);
});

test("remplacement en cours de législature : pas un élu du scrutin", () => {
  // Un sénateur entré en 2025 en remplacement d'un décès ne doit pas
  // apparaître comme élu du scrutin 2026.
  const fiches2 = [fiche({ personne_id: "S2", slug: "s2", prenom: "Bob", nom: "Durand", premier_mandat: "2025-01-01" })];
  const mandats2 = [mandat({ personne_id: "S2", debut: "2025-01-01", fin: "" })];
  const { nouveaux } = classerScrutin(fiches2, mandats2);
  assert.equal(nouveaux.length, 0);
});

test("départements : slug et nom (préfixe de code)", () => {
  assert.equal(slugDepartement("Seine-Saint-Denis"), "seine-saint-denis");
  assert.equal(slugDepartement("Gironde"), "gironde");
  assert.equal(nomDepartement("33 - Gironde"), "Gironde");
  assert.equal(nomDepartement("971 - Guadeloupe"), "Guadeloupe");
});

test("doublons : une personne n'apparaît qu'une fois par liste", () => {
  const mandats2 = [
    mandat({ personne_id: "S19820Y", debut: "2026-09-30", fin: "" }),
    ...mandats.filter((m) => m.personne_id === "S19820Y" || m.personne_id === "S19721W"),
  ];
  const { reelus, sortants } = classerScrutin(fiches, mandats2);
  assert.equal(reelus.filter((s) => s.personne_id === "S19820Y").length, 1);
  assert.equal(sortants.filter((s) => s.personne_id === "S19721W").length, 1);
});

test("fenêtre du scrutin", () => {
  assert.equal(SCRUTIN_2026.debut, "2026-09-01");
  assert.equal(SCRUTIN_2026.fin, "2026-12-31");
});

// ---- Liste officielle (ministère de l'Intérieur, scrutin du 27/09/2026) ----

const officiel = (x: Partial<EluOfficiel>): EluOfficiel => ({
  civilite: "M.", prenom: "", nom: "", departement: "33 - Gironde", ...x,
});

test("élection : libellé et date du scrutin", () => {
  assert.equal(libelleElection(), "27 septembre 2026");
  assert.equal(SCRUTIN_2026.election, "2026-09-27");
});

test("rapprochement des noms : accents, majuscules, tirets", () => {
  assert.equal(nomNormalise("Jean-Pierre", "Vogel"), nomNormalise("Jean Pierre", "VOGEL"));
  assert.equal(nomNormalise("Albéric", "de Montgolfier"), nomNormalise("ALBERIC", "DE MONTGOLFIER"));
  assert.equal(nomNormalise("Sonia", "de La Provôté"), nomNormalise("SONIA", "DE LA PROVOTE"));
});

test("officiel réélu sans mandat 2026 en base : apparaît comme réélu", () => {
  // Bruno Retailleau : en base avec un mandat ancien se terminant au scrutin,
  // mais la ligne « mandat 2026 » n'est pas encore synchronisée.
  const fiches2 = [
    ...fiches,
    fiche({ personne_id: "S04033B", elu_id: "04033B", slug: "retailleau_bruno04033b", civilite: "M.", prenom: "Bruno", nom: "Retailleau", premier_mandat: "2004-10-01", actif: true }),
  ];
  const mandats2 = [
    ...mandats,
    mandat({ personne_id: "S04033B", elu_id: "04033B", debut: "2020-10-01", fin: "2026-09-30", cause_fin: "Fin de mandat" }),
  ];
  const officiels = [officiel({ prenom: "Bruno", nom: "RETAILLEAU", departement: "Vendée" })];
  const { nouveaux, reelus, sortants } = classerScrutin(fiches2, mandats2, officiels);
  assert.deepEqual(reelus.map((s) => s.personne_id), ["S19820Y", "S04033B"]);
  assert.ok(!nouveaux.some((s) => s.personne_id === "S04033B"));
  assert.ok(!sortants.some((s) => s.personne_id === "S04033B"), "un réélu officiel n'est pas sortant");
  assert.equal(reelus.find((s) => s.personne_id === "S04033B")!.election, "2026-09-27");
});

test("officiel absent de la base : listé quand même, sans lien", () => {
  const officiels = [officiel({ civilite: "Mme", prenom: "Mélanie", nom: "VOGEL", departement: "Français établis hors de France" })];
  const { nouveaux, reelus } = classerScrutin(fiches, mandats, officiels);
  const v = nouveaux.find((s) => s.personne_id.startsWith("OFF-"));
  assert.ok(v, "l'officielle absente apparaît parmi les nouveaux");
  assert.equal(v!.slug, "");
  assert.equal(v!.prenom, "Mélanie");
  assert.equal(v!.election, "2026-09-27");
  assert.equal(reelus.filter((s) => s.personne_id.startsWith("OFF-")).length, 0);
});

test("officiel enrichi de sa liste électorale", () => {
  const officiels = [officiel({ civilite: "Mme", prenom: "Géraldine", nom: "AMOUROUX", liste: "Unis pour la Gironde" })];
  const { nouveaux } = classerScrutin(fiches, mandats, officiels);
  const a = nouveaux.find((s) => s.personne_id === "S21714T");
  assert.equal(a!.liste, "Unis pour la Gironde");
});

test("coquille dans la liste officielle : rapprochement sur le nom de famille", () => {
  // Le site du ministère écrit « Chistine BOST » ; la fiche dit « Christine Bost ».
  const officiels = [officiel({ civilite: "Mme", prenom: "Chistine", nom: "BOST", liste: "ENGAGÉS POUR TOUTE LA GIRONDE" })];
  const { nouveaux, sortants } = classerScrutin(fiches, mandats, officiels);
  const b = nouveaux.find((s) => s.personne_id === "S21710P");
  assert.ok(b, "la fiche correspondante est reconnue malgré la coquille");
  assert.equal(b!.liste, "ENGAGÉS POUR TOUTE LA GIRONDE");
  assert.equal(b!.election, "2026-09-27");
  assert.ok(!nouveaux.some((s) => s.personne_id.startsWith("OFF-")), "pas de doublon créé");
});
