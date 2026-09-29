import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeEmail, randomToken, sha256 } from "./tokens.ts";

test("jetons aléatoires, longs et url-safe", () => {
  const a = randomToken();
  const b = randomToken();
  assert.notEqual(a, b);
  assert.match(a, /^[A-Za-z0-9_-]{32}$/);
});

test("sha256 stable et hexadécimal", async () => {
  assert.equal(await sha256("abc"), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
});

test("normalisation des emails", () => {
  assert.equal(normalizeEmail("  Hello@CavaParlement.EU "), "hello@cavaparlement.eu");
});
