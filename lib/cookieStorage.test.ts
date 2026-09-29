import { test } from "node:test";
import assert from "node:assert/strict";

// Simule document.cookie et window pour tester le découpage.
const jar = new Map<string, string>();
(globalThis as any).window = { location: { hostname: "www.cavaparlement.eu", protocol: "https:" } };
(globalThis as any).document = {
  get cookie() { return [...jar].map(([k, v]) => `${k}=${v}`).join("; "); },
  set cookie(s: string) {
    const [kv, ...attrs] = s.split("; ");
    const i = kv.indexOf("=");
    const k = kv.slice(0, i), v = kv.slice(i + 1);
    if (attrs.includes("Max-Age=0")) jar.delete(k); else jar.set(k, v);
  },
};

const { cookieStorage } = await import("./cookieStorage.ts");

test("aller-retour d'une grosse session avec accents", () => {
  const valeur = JSON.stringify({ access_token: "x".repeat(5000), user: { email: "élu@exemple.fr", nom: "Écusson ’quote’" } });
  cookieStorage.setItem("dp-auth", valeur);
  assert.ok([...jar.keys()].filter((k) => k.startsWith("dp-auth.")).length >= 2);
  assert.equal(cookieStorage.getItem("dp-auth"), valeur);
});

test("réécriture plus courte : les morceaux en trop disparaissent", () => {
  cookieStorage.setItem("dp-auth", "court");
  assert.equal(cookieStorage.getItem("dp-auth"), "court");
  assert.ok(!jar.has("dp-auth.1"));
});

test("suppression", () => {
  cookieStorage.removeItem("dp-auth");
  assert.equal(cookieStorage.getItem("dp-auth"), null);
});
