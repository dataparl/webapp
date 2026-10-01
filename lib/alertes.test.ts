import { test } from "node:test";
import assert from "node:assert/strict";
import { aujourdhuiParis, correspond, decaler, lundiDe, messageAlerte, type Abonnement, type MvtAlerte } from "./alertes.ts";

const m = (x: Partial<MvtAlerte>): MvtAlerte => ({
  id: "1", date_event: "2026-10-01", chambre: "senat", type: "arrivee", collab_cle: "dupont jeanne", collab_nom: "DUPONT",
  collab_prenom: "Jeanne", elu_cle: "jadot yannick", elu_id: "21093M", elu_nom: "Yannick JADOT", elu_groupe: "GEST",
  elu_origine_nom: "", elu_origine_groupe: "", ...x,
});
const tout: Abonnement = { frequence: "quotidienne", chambres: ["assemblee", "senat", "europarl"], types: ["arrivee", "depart", "transfert"], groupes: [], elus: [] };

test("filtres : chambre, type, famille, élu", () => {
  assert.equal(correspond(m({}), tout, new Set()), true);
  assert.equal(correspond(m({}), { ...tout, chambres: ["assemblee"] }, new Set()), false);
  assert.equal(correspond(m({}), { ...tout, types: ["depart"] }, new Set()), false);
  assert.equal(correspond(m({}), { ...tout, groupes: ["ECO"] }, new Set()), true);
  assert.equal(correspond(m({ elu_groupe: "LR" }), { ...tout, groupes: ["ECO"] }, new Set()), false);
  assert.equal(correspond(m({}), { ...tout, elus: ["jadot_yannick21093m"] }, new Set(["21093M", "jadot yannick"])), true);
  assert.equal(correspond(m({}), { ...tout, elus: ["autre"] }, new Set(["PA1"])), false);
  // Transfert : l'élu quitté compte aussi.
  assert.equal(correspond(m({ type: "transfert", elu_id: "X", elu_cle: "x", elu_origine_id: "21093M" }), { ...tout, elus: ["s"] }, new Set(["21093M"])), true);
});

test("message quotidien et récapitulatif", () => {
  const q = messageAlerte([m({}), m({ id: "2", type: "depart", chambre: "assemblee", elu_groupe: "EcoS" })], "quotidienne", "2026-10-01");
  assert.match(q.sujet, /2 mouvements/);
  assert.match(q.html, /Jeanne DUPONT/);
  assert.match(q.html, /daily\/2026-10-01/);
  assert.match(q.texte, /quitte l'équipe/);
  const h = messageAlerte([m({})], "hebdomadaire", "2026-10-05");
  assert.match(h.titre, /semaine/);
  assert.match(h.html, /GEST · Sénat/);
  assert.doesNotMatch(messageAlerte([m({ collab_prenom: "<b>" })], "quotidienne", "2026-10-01").html, /<b>/);
});

test("dates", () => {
  assert.equal(lundiDe("2026-10-01"), "2026-09-28");
  assert.equal(lundiDe("2026-10-05"), "2026-10-05");
  assert.equal(decaler("2026-10-01", -1), "2026-09-30");
  assert.equal(aujourdhuiParis(new Date("2026-09-30T23:30:00Z")), "2026-10-01");
});
