import { test } from "node:test";
import assert from "node:assert/strict";
import { attention, dateAdressage, gabarit, prenomNomAdresse, texteVersHtml } from "./gabarit.ts";

test("gabarit : lien en ligne, titre échappé, pied de carte", () => {
  const h = gabarit({ titre: "Re: <test>", corpsHtml: "<p>x</p>", lireUrl: "https://mail.dataparl.fr/lire/abc" });
  assert.match(h, /consulte-le en ligne/);
  assert.match(h, /mail\.dataparl\.fr\/lire\/abc/);
  assert.match(h, /Re: &lt;test&gt;/);
  assert.match(h, /Informations légales/);
  assert.doesNotMatch(gabarit({ titre: "t", corpsHtml: "" }), /consulte-le en ligne/);
});

test("texte vers HTML : échappement et citations", () => {
  const h = texteVersHtml("Bonjour <b>\nligne 2\n\n> cité\n> encore");
  assert.match(h, /Bonjour &lt;b&gt;<br>ligne 2/);
  assert.match(h, /<blockquote[^>]*>cité<br>encore<\/blockquote>/);
});

test("alertes : édition, date et adressage avec élision", () => {
  assert.equal(dateAdressage("2026-10-01"), "01 Octobre 2026");
  assert.equal(attention("Jean DUPONT"), "À l'attention de Jean DUPONT");
  assert.equal(attention("Émilie DURAND"), "À l'attention d'Émilie DURAND");
  assert.equal(attention("Hélène MARTIN"), "À l'attention d'Hélène MARTIN");
  assert.equal(prenomNomAdresse("jean-pierre", "de la tour"), "Jean-Pierre DE LA TOUR");
  const h = gabarit({ titre: "t", corpsHtml: "", edition: "Weekly", adressage: { date: "2026-10-05", pour: "Anne <X>" } });
  assert.match(h, />Weekly</);
  assert.match(h, /05 Octobre 2026/);
  assert.match(h, /À l&#39;attention d&#39;Anne &lt;X&gt;/);
});
