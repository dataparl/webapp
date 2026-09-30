import { test } from "node:test";
import assert from "node:assert/strict";
import { doitRepondre, entetes } from "./autoReponse.ts";

const base = { from: "Jeanne <jeanne@exemple.fr>", subject: "Question sur l'API", headers: {} };

test("accusé de réception pour un premier message", () => {
  assert.equal(doitRepondre(base), true);
});

test("pas d'accusé pour une réponse, un transfert, un robot, une liste, nous-mêmes", () => {
  assert.equal(doitRepondre({ ...base, headers: { "in-reply-to": "<a@b>" } }), false);
  assert.equal(doitRepondre({ ...base, subject: "RE: Question" }), false);
  assert.equal(doitRepondre({ ...base, subject: "Fwd: Question" }), false);
  assert.equal(doitRepondre({ ...base, headers: { "auto-submitted": "auto-replied" } }), false);
  assert.equal(doitRepondre({ ...base, headers: { precedence: "bulk" } }), false);
  assert.equal(doitRepondre({ ...base, headers: { "list-id": "<x>" } }), false);
  assert.equal(doitRepondre({ ...base, from: "noreply@service.fr" }), false);
  assert.equal(doitRepondre({ ...base, from: "MAILER-DAEMON@mx.fr" }), false);
  assert.equal(doitRepondre({ ...base, from: "hello@mail.cavaparlement.eu" }), false);
  assert.equal(doitRepondre({ ...base, headers: { "auto-submitted": "no" } }), true);
});

test("en-têtes : objet ou liste, clés en minuscules", () => {
  assert.deepEqual(entetes({ "In-Reply-To": "<x>" }), { "in-reply-to": "<x>" });
  assert.deepEqual(entetes([{ name: "List-Id", value: "l" }]), { "list-id": "l" });
});
