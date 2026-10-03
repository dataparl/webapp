import assert from "node:assert/strict";
import { test } from "node:test";
import { COULEUR_CHAMBRE, couleurChambre, couleurParti, COULEUR_NEUTRE } from "./couleurs.ts";

test("les trois chambres ont chacune leur couleur", () => {
  assert.equal(couleurChambre("senat"), "#D71920");
  assert.equal(couleurChambre("assemblee"), "#164DFF");
  assert.equal(couleurChambre("europarl"), "#003399");
  assert.ok(Object.keys(COULEUR_CHAMBRE).length === 3);
});

test("les partis retrouvent leur teinte usuelle, sigles en majuscules ou non", () => {
  assert.equal(couleurParti("RN"), "#002B5C");
  assert.equal(couleurParti("rn"), "#002B5C");
  assert.equal(couleurParti("RN-UDR"), couleurParti("RN"));
  assert.equal(couleurParti("LR"), "#0066CC");
  assert.equal(couleurParti("Divers centre"), "#E6C700");
});

test("un sigle inconnu retombe sur le gris neutre", () => {
  assert.equal(couleurParti("XYZ-2026"), COULEUR_NEUTRE);
  assert.equal(couleurParti(""), COULEUR_NEUTRE);
});
