import { test } from "node:test";
import assert from "node:assert/strict";

// Copie locale des formules (le module réel importe "server-only").
const tauxTurnover = (x: { effectif: number; departs_12m: number; arrivees_12m: number }) => {
  const moyen = x.effectif + (x.departs_12m - x.arrivees_12m) / 2;
  return moyen > 0 ? x.departs_12m / moyen : null;
};

test("taux de renouvellement : équipe stable de 4, 2 départs remplacés", () => {
  assert.equal(tauxTurnover({ effectif: 4, departs_12m: 2, arrivees_12m: 2 }), 0.5);
});

test("taux : équipe qui a fondu de 6 à 4", () => {
  assert.equal(tauxTurnover({ effectif: 4, departs_12m: 2, arrivees_12m: 0 }), 0.4);
});

test("taux : aucun effectif", () => {
  assert.equal(tauxTurnover({ effectif: 0, departs_12m: 0, arrivees_12m: 0 }), null);
});
