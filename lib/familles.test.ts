import { test } from "node:test";
import assert from "node:assert/strict";
import { familleDe, resume, siglesDe, suggererGroupes, FAMILLES } from "./familles.ts";

test("GEST propose la famille ECO en premier", () => {
  const s = suggererGroupes("GEST");
  assert.equal(s[0].valeur, "ECO");
  assert.ok(s.some((x) => x.valeur === "GEST"));
  assert.equal(suggererGroupes("verts")[0].valeur, "ECO");
  assert.equal(suggererGroupes("écolo")[0].valeur, "ECO");
});

test("correspondances entre chambres", () => {
  assert.equal(familleDe("senat", "GEST")?.code, "ECO");
  assert.equal(familleDe("assemblee", "EcoS")?.code, "ECO");
  assert.equal(familleDe("europarl", "Verts/ALE")?.code, "ECO");
  assert.equal(familleDe("assemblee", "LFI-NFP")?.code, "LFI");
  assert.deepEqual(siglesDe("ECO", "senat").sort(), ["ECO", "ECOLO", "GEST"]);
  assert.deepEqual(siglesDe("GEST"), ["GEST"]);
  assert.equal(resume(FAMILLES.find((f) => f.code === "ECO")!), "GEST au Sénat, EcoS à l'AN, Verts/ALE au PE");
});

test("chaque groupe actuel des données a une famille", () => {
  for (const [c, s] of [["assemblee", "RN"], ["assemblee", "EPR"], ["assemblee", "Dem"], ["assemblee", "HOR"], ["assemblee", "LIOT"],
    ["assemblee", "GDR"], ["assemblee", "UDR"], ["assemblee", "DR"], ["assemblee", "SOC"], ["assemblee", "NI"],
    ["senat", "LR"], ["senat", "SER"], ["senat", "UC"], ["senat", "INDEP"], ["senat", "RDPI"], ["senat", "CRCE-K"],
    ["senat", "RDSE"], ["senat", "NI"]]) assert.ok(familleDe(c, s), `${c} ${s}`);
});
