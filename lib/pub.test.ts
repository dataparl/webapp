import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { jetonValide, lireRappel, rappelValide } from "./pub.ts";

const md5 = (s: string) => createHash("md5").update(s).digest("hex");
const userId = "0123456789abcdef0123456789abcdef";
const base = { gameApiKey: "cle-publique", gameId: "42", userId, tid: "t-123" };

test("rappel AppLixir signé MD5 + TID", () => {
  const signature = md5(base.gameApiKey + base.gameId + userId + base.tid + "secret");
  assert.equal(rappelValide({ ...base, signature }, "cle-publique", "secret"), true);
  assert.equal(rappelValide({ ...base, signature }, "autre-cle", "secret"), false);
  assert.equal(rappelValide({ ...base, signature }, "cle-publique", "autre-secret"), false);
  assert.equal(rappelValide({ ...base, userId: "f".repeat(32), signature }, "cle-publique", "secret"), false);
  assert.equal(rappelValide({ ...base, tid: "t-999", signature }, "cle-publique", "secret"), false);
  assert.equal(rappelValide({ ...base, signature: "x" }, "cle-publique", "secret"), false);
  assert.equal(rappelValide({ ...base, signature }, "cle-publique", ""), false);
});

test("autres modes : MD5 sans TID, secret simple", () => {
  assert.equal(rappelValide({ ...base, tid: "", signature: md5(base.gameApiKey + base.gameId + userId + "secret") }, "cle-publique", "secret"), true);
  assert.equal(rappelValide({ ...base, signature: md5(userId + base.tid + "secret") }, "cle-publique", "secret"), true);
  assert.equal(rappelValide({ ...base, signature: "", secretKey: "secret" }, "cle-publique", "secret"), true);
  assert.equal(rappelValide({ ...base, signature: "", secretKey: "secreT" }, "cle-publique", "secret"), false);
  assert.equal(rappelValide({ ...base, signature: md5(userId) }, "cle-publique", "secret"), false);
});

test("noms de paramètres variables", () => {
  const r = lireRappel({ user_id: userId, uniquetid: "u1", checksum: "ab", site_id: "7" });
  assert.deepEqual([r.userId, r.tid, r.signature, r.gameId], [userId, "u1", "ab", "7"]);
});

test("jeton transmis au lecteur", () => {
  assert.equal(jetonValide("0123456789abcdef0123456789abcdef"), true);
  assert.equal(jetonValide("6609a30b-c6e8-482d-90cd-925c70c300d2"), false);
});
