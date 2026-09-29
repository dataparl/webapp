import { test } from "node:test";
import assert from "node:assert/strict";
import { emailCollabAN, emailCollabSenat, emailElu } from "./emails.ts";

test("Sénat : exemples du cahier des charges", () => {
  assert.equal(emailCollabSenat("Jean-Pierre", "MARTIN"), "jp.martin@clb.senat.fr");
  assert.equal(emailCollabSenat("Marie-Dominique", "AESCHLIMANN"), "md.aeschlimann@clb.senat.fr");
  assert.equal(emailCollabSenat("Anne", "RENAUD-GARABEDIAN"), "a.renaud-garabedian@clb.senat.fr");
  assert.equal(emailCollabSenat("Jean Hermann", "SAMBENOUN"), "jh.sambenoun@clb.senat.fr");
  assert.equal(emailCollabSenat("Élodie", "D'ARTAGNAN"), "e.dartagnan@clb.senat.fr");
});

test("Assemblée : exemples du cahier des charges", () => {
  assert.equal(emailCollabAN("Jean-Pierre", "Martin"), "jean-pierre.martin@clb-an.fr");
  assert.equal(emailCollabAN("Jean", "Martin"), "jean.martin@clb-an.fr");
  assert.equal(emailCollabAN("Bastien", "Rosso-Cadetto"), "bastien.rosso-cadetto@clb-an.fr");
  assert.equal(emailCollabAN("Raphaël", "Hérimian"), "raphael.herimian@clb-an.fr");
});

test("Élus", () => {
  assert.equal(emailElu("senat", "Pascal ALLIZARD"), "p.allizard@senat.fr");
  assert.equal(emailElu("assemblee", "Olivier Fayssat"), "olivier.fayssat@assemblee-nationale.fr");
  assert.equal(emailElu("europarl", "Manon AUBRY"), null);
});
