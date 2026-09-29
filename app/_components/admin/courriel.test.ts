import { test } from "node:test";
import assert from "node:assert/strict";
import { adresse, documentLecture, listeAdresses, nomAffiche, prefixer } from "./courriel.ts";

test("adresses", () => {
  assert.equal(adresse('"Jeanne D." <Jeanne@Exemple.fr>'), "jeanne@exemple.fr");
  assert.equal(nomAffiche('"Jeanne D." <jeanne@exemple.fr>'), "Jeanne D.");
  assert.deepEqual(listeAdresses("a@b.fr, Bob <c@d.eu>; pasuneadresse"), ["a@b.fr", "c@d.eu"]);
});

test("préfixes d'objet", () => {
  assert.equal(prefixer("Bonjour", "Re"), "Re: Bonjour");
  assert.equal(prefixer("RE: Bonjour", "Re"), "RE: Bonjour");
  assert.equal(prefixer("Fwd: x", "Tr"), "Fwd: x");
});

test("lecture : images distantes bloquées par défaut", () => {
  assert.match(documentLecture("<p>x</p>", false), /img-src data: cid:;/);
  assert.match(documentLecture("<p>x</p>", true), /img-src data: cid: https:;/);
  assert.match(documentLecture("", false), /default-src 'none'/);
});
