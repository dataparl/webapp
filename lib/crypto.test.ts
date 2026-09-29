import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac, randomBytes } from "node:crypto";
import { chiffrer, dechiffrer, signerJeton, verifierJeton, verifierSvix } from "./crypto.ts";

const CLE = randomBytes(32).toString("base64");

test("chiffrement aller-retour, et altération détectée", () => {
  const c = chiffrer("JBSWY3DPEHPK3PXP", CLE);
  assert.equal(dechiffrer(c, CLE), "JBSWY3DPEHPK3PXP");
  const [iv, tag, d] = c.split(".");
  assert.throws(() => dechiffrer([iv, tag, d.slice(0, -2) + "AA"].join("."), CLE));
});

test("jeton de second facteur : valide, expiré, autre utilisateur, falsifié", () => {
  const t0 = 1_800_000_000_000;
  const j = signerJeton("u1", "s", 900, t0);
  assert.equal(verifierJeton(j, "u1", "s", t0 + 60_000), true);
  assert.equal(verifierJeton(j, "u1", "s", t0 + 901_000), false);
  assert.equal(verifierJeton(j, "u2", "s", t0), false);
  assert.equal(verifierJeton(j.replace(/.$/, "x"), "u1", "s", t0), false);
  assert.equal(verifierJeton(null, "u1", "s", t0), false);
});

test("signature Svix", () => {
  const secret = "whsec_" + randomBytes(24).toString("base64");
  const corps = '{"type":"email.received"}';
  const ts = "1800000000";
  const sig = createHmac("sha256", Buffer.from(secret.slice(6), "base64")).update(`msg_1.${ts}.${corps}`).digest("base64");
  const h = new Headers({ "svix-id": "msg_1", "svix-timestamp": ts, "svix-signature": `v1,autre v1,${sig}` });
  assert.equal(verifierSvix(corps, h, secret, 1_800_000_010_000), true);
  assert.equal(verifierSvix(corps + " ", h, secret, 1_800_000_010_000), false);
  assert.equal(verifierSvix(corps, h, secret, 1_800_001_000_000), false);
});
