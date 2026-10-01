import { test } from "node:test";
import assert from "node:assert/strict";
import { signatureHtml, vcard } from "./signature.ts";

test("signature et vCard", () => {
  const h = signatureHtml("Marie <de> DataParl'", "Éditrice", "marie@dataparl.fr");
  assert.match(h, /Marie &lt;de&gt; DataParl&#39;/);
  assert.match(h, /mailto:marie@dataparl\.fr/);
  const c = vcard("Dupont, Marie", "Éditrice", "marie@dataparl.fr");
  assert.match(c, /^BEGIN:VCARD\r\nVERSION:3\.0\r\n/);
  assert.match(c, /FN:Dupont\\, Marie/);
  assert.match(c, /EMAIL;TYPE=INTERNET,WORK:marie@dataparl\.fr/);
});
