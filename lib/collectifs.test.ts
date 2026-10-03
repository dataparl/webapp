import { test } from "node:test";
import assert from "node:assert/strict";
import { CHAMBRE_COURTE, decomposerSlugGroupe, groupeDepuisSlug, hrefDepartement, hrefGroupe, hrefParti, partiDepuisSlug, slugCollectif, sansGroupe } from "./collectifs.ts";
import { slugDepartement } from "./senatorialesClassement.ts";

test("slugs de collectifs", () => {
  assert.equal(slugCollectif("GUE/NGL"), "gue-ngl");
  assert.equal(slugCollectif("LFI-NFP"), "lfi-nfp");
  assert.equal(slugCollectif("Verts/ALE"), "verts-ale");
  assert.equal(slugCollectif("CRCE-K"), "crce-k");
});

test("adresses de groupes, départements et partis", () => {
  assert.equal(hrefGroupe("senat", "RN"), "/groupe/senat-rn/");
  assert.equal(hrefGroupe("assemblee", "LFI-NFP"), "/groupe/an-lfi-nfp/");
  assert.equal(hrefGroupe("europarl", "Verts/ALE"), "/groupe/pe-verts-ale/");
  assert.equal(hrefGroupe("senat", ""), null);
  assert.equal(hrefDepartement("Gironde", slugDepartement), "/departement/gironde/");
  assert.equal(hrefDepartement("Seine-Saint-Denis", slugDepartement), "/departement/seine-saint-denis/");
  assert.equal(hrefParti("RN"), "/parti/rn/");
});

test("décomposition d'un slug de groupe (tirets dans le sigle)", () => {
  assert.deepEqual(decomposerSlugGroupe("senat-rn"), { chambre: "senat", slugSigle: "rn" });
  assert.deepEqual(decomposerSlugGroupe("an-lfi-nfp"), { chambre: "assemblee", slugSigle: "lfi-nfp" });
  assert.deepEqual(decomposerSlugGroupe("pe-verts-ale"), { chambre: "europarl", slugSigle: "verts-ale" });
  assert.equal(decomposerSlugGroupe("rn"), null);
});

test("retrouve groupe et parti depuis un slug", () => {
  const groupes = [
    { chambre: "senat", groupe: "RN", groupe_libelle: "Rassemblement National" },
    { chambre: "assemblee", groupe: "LFI-NFP", groupe_libelle: "La France insoumise" },
  ];
  assert.equal(groupeDepuisSlug("senat-rn", groupes)?.groupe, "RN");
  assert.equal(groupeDepuisSlug("an-lfi-nfp", groupes)?.groupe, "LFI-NFP");
  assert.equal(groupeDepuisSlug("senat-lfi-nfp", groupes), null);
  assert.equal(partiDepuisSlug("rn", ["LR", "RN", "SOC"]), "RN");
  assert.equal(partiDepuisSlug("zzz", ["RN"]), null);
});

test("« Aucun » n'est pas un groupe", () => {
  assert.equal(sansGroupe("Aucun"), true);
  assert.equal(sansGroupe(""), true);
  assert.equal(sansGroupe("RN"), false);
  assert.equal(CHAMBRE_COURTE.assemblee, "an");
});
