import { test } from "node:test";
import assert from "node:assert/strict";
import { cheminConnu, estInactif, profondeur } from "./pagesRegistre.ts";

test("pages inactives : la page et ses sous-pages", () => {
  const off = ["/vigiparl", "/daily"];
  assert.equal(estInactif("/vigiparl", off), true);
  assert.equal(estInactif("/vigiparl/methode/", off), true);
  assert.equal(estInactif("/daily/2026-10-01", off), true);
  assert.equal(estInactif("/vigiparlx", off), false);
  assert.equal(estInactif("/", ["/"]), false);
  assert.equal(cheminConnu("/presse"), true);
  assert.equal(cheminConnu("/connexion"), false);
  assert.equal(cheminConnu("/api/x"), false);
  assert.equal(profondeur("/vigiparl/an/parlementaires"), 3);
});
