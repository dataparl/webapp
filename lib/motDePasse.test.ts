import { test } from "node:test";
import assert from "node:assert/strict";
import { adresseEquipe, genererMotDePasse, motDePasseValide } from "./motDePasse.ts";

test("génération et validation des mots de passe", () => {
  const m = genererMotDePasse();
  assert.equal(m.length, 14);
  assert.notEqual(m, genererMotDePasse());
  assert.equal(motDePasseValide(m), null);
  assert.match(motDePasseValide("court") ?? "", /8 caractères/);
});

test("adresses de l'équipe", () => {
  assert.equal(adresseEquipe("Marie"), "marie@dataparl.fr");
  assert.equal(adresseEquipe("marie.dupont", "staff"), "marie.dupont@staff.dataparl.fr");
  assert.equal(adresseEquipe("marie@x"), null);
  assert.equal(adresseEquipe(".marie"), null);
  assert.equal(adresseEquipe("marie", "sous.domaine"), null);
});
