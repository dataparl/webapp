import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { jetonValide, rappelValide } from "./pub.ts";


test("rappel AppLixir signé MD5 + TID", () => {
  const userId = "0123456789abcdef0123456789abcdef";
  const base = { gameApiKey: "cle-publique", gameId: "42", userId, tid: "t-123" };
  const signature = createHash("md5").update(base.gameApiKey + base.gameId + userId + base.tid + "secret").digest("hex");
  assert.equal(rappelValide({ ...base, signature }, "cle-publique", "secret"), true);
  assert.equal(rappelValide({ ...base, signature }, "autre-cle", "secret"), false);
  assert.equal(rappelValide({ ...base, signature }, "cle-publique", "autre-secret"), false);
  assert.equal(rappelValide({ ...base, userId: "f".repeat(32), signature }, "cle-publique", "secret"), false);
  assert.equal(rappelValide({ ...base, signature: "x" }, "cle-publique", "secret"), false);
});

test("jeton transmis au lecteur", () => {
  assert.equal(jetonValide("0123456789abcdef0123456789abcdef"), true);
  assert.equal(jetonValide("6609a30b-c6e8-482d-90cd-925c70c300d2"), false);
});
