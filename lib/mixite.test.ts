import { test } from "node:test";
import assert from "node:assert/strict";
import { mixite } from "./mixite.ts";

test("parité, non-mixité, exclusions", () => {
  const r = mixite([
    { femmes: 3, hommes: 2, indetermines: 0 }, // 60 % : parité
    { femmes: 4, hommes: 4, indetermines: 0 }, // parité
    { femmes: 3, hommes: 0, indetermines: 0 }, // non mixte
    { femmes: 1, hommes: 0, indetermines: 0 }, // 1 personne : hors périmètre
    { femmes: 2, hommes: 1, indetermines: 1 }, // genre indéterminé : exclue
    { femmes: 1, hommes: 3, indetermines: 0 }, // 25 % : ni l'un ni l'autre
  ]);
  assert.deepEqual(r, { eligibles: 4, exclues: 1, paritaires: 2, nonMixtes: 1 });
});
