import { test } from "node:test";
import assert from "node:assert/strict";
import { analyserFichier, cheminPhoto, sourceAutorisee } from "./media.ts";

test("adresses des photos", () => {
  assert.equal(cheminPhoto("senat", "sido_bruno01058x", 200), "/media/senat/sido_bruno01058x_senat_200.png");
  assert.equal(cheminPhoto("assemblee", "PA1008", 96), "/media/an/PA1008_an_96.png");
  assert.equal(cheminPhoto("autre", "x"), null);
  assert.deepEqual(analyserFichier("sido_bruno01058x_senat_200.png"), { id: "sido_bruno01058x", credit: "senat", taille: 200 });
  assert.deepEqual(analyserFichier("101580_pe_400.png"), { id: "101580", credit: "pe", taille: 400 });
  assert.equal(analyserFichier("PA1008_an_123.png"), null);
  assert.equal(analyserFichier("../x_an_96.png"), null);
  assert.equal(sourceAutorisee("https://www.senat.fr/senimg/x.jpg"), true);
  assert.equal(sourceAutorisee("https://exemple.fr/x.jpg"), false);
  assert.equal(sourceAutorisee("http://www.senat.fr/x.jpg"), false);
});
