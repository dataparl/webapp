import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { analyserJORF, xmlDuZip } from "./jorf.ts";

// Le balayage du JORF : lecture du zip DILA et analyse des mesures nominatives
// (gouvernement, cabinets ministériels).

const TEXTE_CABINET = `<?xml version="1.0" encoding="UTF-8"?>
<TEXTE cid="JORFTEXT000000000001" natures="DECRET">
  <META>
    <META_COMMUN><ID>JORFCONT000000000001</ID></META_COMMUN>
    <META_TEXTE_CHRONICLE>
      <TITRE>Décret du 24 septembre 2024 portant nomination du directeur de cabinet du ministre de l'industrie, du commerce et de l'énergie</TITRE>
      <DATE_TEXTE>20240924</DATE_TEXTE>
      <NATURE>Décret</NATURE>
    </META_TEXTE_CHRONICLE>
    <SM><NOMS><PERSONNE><NOM>DUPONT</NOM><PRENOM>Marie</PRENOM><CIVILITE>Mme</CIVILITE></PERSONNE></NOMS></SM>
  </META>
  <TEXTECL><Titre>...</Titre></TEXTECL>
  <CONTENU><p>Décret du 24 septembre 2024 portant nomination du directeur de cabinet du ministre de l'industrie, du commerce et de l'énergie</p><p>La Présidente de la République, sur le rapport du Premier ministre, Décrète :</p><p>Art. 1er. — Mme DUPONT Marie, administratrice civile hors classe, est nommée directeur de cabinet de M. FERRACCI Marc, ministre de l'industrie, du commerce et de l'énergie.</p></CONTENU>
</TEXTE>`;

const TEXTE_MINISTRE = `<?xml version="1.0" encoding="UTF-8"?>
<TEXTE cid="JORFTEXT000000000002" natures="DECRET">
  <META>
    <META_TEXTE_CHRONICLE>
      <TITRE>Décret du 21 septembre 2024 relatif à la composition du Gouvernement</TITRE>
      <DATE_TEXTE>20240921</DATE_TEXTE>
      <NATURE>Décret</NATURE>
    </META_TEXTE_CHRONICLE>
    <SM><NOMS><PERSONNE nom="FERRACCI" prenom="Marc"/><PERSONNE><NOM>MARTIN</NOM><PRENOM>Julien</PRENOM></PERSONNE></NOMS></SM>
  </META>
  <CONTENU><p>Décret du 21 septembre 2024 relatif à la composition du Gouvernement</p><p>Art. 1er. — M. FERRACCI Marc est nommé ministre de l'industrie et de l'énergie.</p><p>M. MARTIN Julien est nommé ministre de la culture.</p></CONTENU>
</TEXTE>`;

const TEXTE_CESSION = `<?xml version="1.0" encoding="UTF-8"?>
<TEXTE cid="JORFTEXT000000000003" natures="DECRET">
  <META>
    <META_TEXTE_CHRONICLE>
      <TITRE>Décret du 1er octobre 2026 portant cessation de fonctions d'un directeur de cabinet</TITRE>
      <DATE_TEXTE>20261001</DATE_TEXTE>
      <NATURE>Décret</NATURE>
    </META_TEXTE_CHRONICLE>
    <SM><NOMS><PERSONNE nom="DUPONT" prenom="Marie"/></NOMS></SM>
  </META>
  <CONTENU><p>Décret du 1er octobre 2026 portant cessation de fonctions d'un directeur de cabinet</p><p>Art. 1er. — Mme DUPONT Marie cesse de exercer ses fonctions de directeur de cabinet du ministre de l'industrie.</p></CONTENU>
</TEXTE>`;

const TEXTE_HORS_CHAMP = `<?xml version="1.0" encoding="UTF-8"?>
<TEXTE><META><META_TEXTE_CHRONICLE><TITRE>Décret du 2 octobre 2024 relatif aux tarifs du gaz</TITRE><DATE_TEXTE>20241002</DATE_TEXTE><NATURE>Décret</NATURE></META_TEXTE_CHRONICLE></META><CONTENU><p>Tarifs réglementés.</p></CONTENU></TEXTE>`;

test("mesures nominatives : gouvernement et cabinets", () => {
  const ms = analyserJORF(TEXTE_CABINET + TEXTE_MINISTRE + TEXTE_CESSION + TEXTE_HORS_CHAMP, "2024-09-24");
  assert.equal(ms.length, 4, JSON.stringify(ms, null, 1));
  const cab = ms.find((m) => m.role === "cabinet" && m.type === "nomination");
  assert.ok(cab, "un membre de cabinet");
  assert.equal(cab.prenom, "Marie"); assert.equal(cab.nom, "DUPONT");
  assert.equal(cab.ministre?.nom, "FERRACCI");
  assert.match(cab.fonction, /directeur de cabinet/i);
  const min = ms.find((m) => m.role === "ministre" && m.nom === "FERRACCI");
  assert.ok(min, "un ministre"); assert.equal(min.type, "nomination");
  assert.match(min.portefeuille, /industrie/i);
  const cess = ms.find((m) => m.type === "cessation");
  assert.ok(cess); assert.equal(cess.nom, "DUPONT");
  assert.ok(!ms.some((m) => /gaz/i.test(m.titre)), "hors champ écarté");
});

test("zip DILA : lecture et décompression", { skip: !existsSync("/usr/bin/zip") }, () => {
  const dir = "/tmp/jorfzip";
  rmSync(dir, { recursive: true, force: true });
  execSync(`mkdir -p ${dir} && printf '%s' '${TEXTE_MINISTRE.replace(/'/g, "'\\''")}' > ${dir}/JORF_20240921.xml`);
  // Méthode 8 (deflate, cas DILA) et méthode 0 (stocké) : les deux se lisent.
  execSync(`cd ${dir} && zip -q -X flate.zip JORF_20240921.xml && zip -q -0 -X stock.zip JORF_20240921.xml`);
  for (const nom of ["flate.zip", "stock.zip"]) {
    const xml = xmlDuZip(Buffer.from(readFileSync(`${dir}/${nom}`)));
    assert.equal(xml.length, 1);
    const ms = analyserJORF(xml[0], "2024-09-21");
    assert.ok(ms.some((m) => m.nom === "FERRACCI"), nom);
  }
  rmSync(dir, { recursive: true, force: true });
});
