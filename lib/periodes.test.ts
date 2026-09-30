import { test } from "node:test";
import assert from "node:assert/strict";
import { chevauche, dureeMois, libellePeriode } from "./periodes.ts";

test("chevauchement avec bornes ouvertes", () => {
  assert.equal(chevauche({ debut: "2020-01-01", fin: "2021-01-01" }, { debut: "2020-06-01", fin: "" }), true);
  assert.equal(chevauche({ debut: "2020-01-01", fin: "2021-01-01" }, { debut: "2021-02-01", fin: "" }), false);
  assert.equal(chevauche({ debut: "", fin: "2019-01-01" }, { debut: "2010-01-01", fin: "2012-01-01" }), true);
});

test("libellés de période", () => {
  assert.equal(libellePeriode({ debut: "2019-03-10", debut_connu: true, fin: "2022-06-24", fin_connue: true, en_cours: false }), "de mars 2019 à juin 2022");
  assert.equal(libellePeriode({ debut: "2023-10-04", debut_connu: true, fin: "", fin_connue: false, en_cours: true }), "depuis oct. 2023");
  assert.match(libellePeriode({ debut: "2017-02-22", debut_connu: false, fin: "2018-03-01", fin_connue: true, en_cours: false }), /^avant févr\. 2017 jusqu'à mars 2018$/);
  assert.equal(dureeMois("2020-01-01", "2021-01-01"), 12);
});

import { fusionner } from "./periodes.ts";
test("fusion des appartenances successives", () => {
  const c = (debut: string, fin: string, libelle = "Commission des lois", fonction = "Membre") => ({ debut, fin, libelle, fonction });
  const f = fusionner([c("2024-07-01", "2024-08-01"), c("2024-08-02", "2024-10-01"), c("2025-06-01", ""), c("2024-07-01", "", "Commission des finances")]);
  assert.deepEqual(f.map((x) => [x.libelle, x.debut, x.fin]), [
    ["Commission des lois", "2025-06-01", ""], ["Commission des finances", "2024-07-01", ""], ["Commission des lois", "2024-07-01", "2024-10-01"],
  ]);
  assert.equal(chevauche({ debut: "2022-06-22", fin: "" }, { debut: "2017-06-27", fin: "2022-06-21" }, 7), false);
});
