import { test } from "node:test";
import assert from "node:assert/strict";
import { gabarit, texteVersHtml } from "./gabarit.ts";

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
