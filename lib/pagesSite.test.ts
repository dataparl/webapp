import { test } from "node:test";
import assert from "node:assert/strict";
import { pagesPour } from "./pagesSite.ts";

test("pages : préfixes, accents, plusieurs mots", () => {
  assert.equal(pagesPour("vigi")[0].href, "/vigiparl");
  assert.ok(pagesPour("parité").some((p) => p.href === "/mixiparl"));
  assert.ok(pagesPour("methode vigi").every((p) => p.href === "/vigiparl/methode"));
  assert.deepEqual(pagesPour("zzz"), []);
  assert.equal(pagesPour("mouvements", 2).length, 2);
});
