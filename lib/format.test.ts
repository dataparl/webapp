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
