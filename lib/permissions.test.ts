import { test } from "node:test";
import assert from "node:assert/strict";
import { defaut, modulesDe } from "./permissions.ts";

test("rôle par défaut, puis réglages", () => {
  assert.equal(defaut("editeur", "communication"), true);
  assert.equal(defaut("editeur", "elus"), true);
  assert.equal(defaut("utilisateur", "elus"), false);
  assert.equal(defaut("utilisateur", "communication"), false);
  assert.equal(defaut("editeur", "journal"), false);
  assert.deepEqual(modulesDe("utilisateur", []), []);
  assert.deepEqual(modulesDe("utilisateur", [{ module: "contenu_liens", autorise: true }]), ["contenu_liens"]);
  assert.ok(!modulesDe("editeur", [{ module: "communication", autorise: false }]).includes("communication"));
  // Un administrateur ne peut pas être restreint ; un module inconnu est ignoré.
  assert.equal(modulesDe("admin", [{ module: "journal", autorise: false }]).length, 12);
  assert.deepEqual(modulesDe("utilisateur", [{ module: "inconnu", autorise: true }]), []);
  // Modules réservés : jamais ouverts hors administrateurs.
  assert.deepEqual(modulesDe("editeur", [{ module: "journal", autorise: true }, { module: "cles_api", autorise: true }]).filter((m) => m === "journal" || m === "cles_api"), []);
});
