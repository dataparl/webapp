import { test } from "node:test";
import assert from "node:assert/strict";
import { slugSenat } from "./format.ts";

test("slug senat.fr", () => {
  assert.equal(slugSenat("Yannick JADOT", "21093M"), "jadot_yannick21093m");
  assert.equal(slugSenat("Marie-Do AESCHLIMANN", "21071F"), "aeschlimann_marie_do21071f");
  assert.equal(slugSenat("Pascal ALLIZARD", "14133K"), "allizard_pascal14133k");
});

import { cleNom } from "./format.ts";
test("clé de nom identique au pipeline", () => {
  assert.equal(cleNom("Marie-Hélène", "D'ARTOIS"), "artois d helene marie");
  assert.equal(cleNom("Zoé", "Le Guen"), "guen le zoe");
});

import { nomAffiche, prenomNom } from "./format.ts";
test("noms au format Prénom NOM", () => {
  assert.equal(prenomNom("Léo", "Bares"), "Léo BARES");
  assert.equal(prenomNom("JEAN-MARC", "Arnaud-Deromedi"), "Jean-Marc ARNAUD-DEROMEDI");
  assert.equal(prenomNom("Ségolène", "de Maupeou"), "Ségolène de MAUPEOU");
  assert.equal(prenomNom("Anne", "d'Artois"), "Anne d'ARTOIS");
  assert.equal(nomAffiche("François Ruffin"), "François RUFFIN");
  assert.equal(nomAffiche("Corinne NARASSIGUIN"), "Corinne NARASSIGUIN");
  assert.equal(nomAffiche("Annaïg Le Meur"), "Annaïg LE MEUR");
  assert.equal(nomAffiche("de LEGGE Dominique"), "Dominique de LEGGE");
  assert.equal(nomAffiche("Christine LANFRANCHI DORGAL"), "Christine LANFRANCHI DORGAL");
  assert.equal(nomAffiche("Evelyne YONNET-SALVATOR"), "Evelyne YONNET-SALVATOR");
  assert.equal(prenomNom("Alexandra", "Martin (Alpes-Maritimes)"), "Alexandra MARTIN (Alpes-Maritimes)");
});
