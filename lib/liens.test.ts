import { test } from "node:test";
import assert from "node:assert/strict";
import { appareilDe, CODE, destinationValide, genererCode, masquerIp, sourceDe } from "./liens.ts";

test("liens tracés", () => {
  assert.match(genererCode(), CODE);
  assert.equal(destinationValide("https://www.dataparl.fr/presse"), "https://www.dataparl.fr/presse");
  assert.equal(destinationValide("javascript:alert(1)"), null);
  assert.equal(destinationValide("http://exemple.fr"), null);
  assert.equal(destinationValide("https://a:b@exemple.fr"), null);
  assert.equal(sourceDe("https://t.co/abc", null), "X (Twitter)");
  assert.equal(sourceDe("https://www.linkedin.com/feed", null), "LinkedIn");
  assert.equal(sourceDe("https://lemonde.fr/x", null), "lemonde.fr");
  assert.equal(sourceDe("https://t.co/abc", "bluesky"), "Bluesky");
  assert.equal(sourceDe(null, null), "Direct");
  assert.equal(masquerIp("203.0.113.57, 10.0.0.1"), "203.0.113.0");
  assert.equal(masquerIp("2001:db8:abcd:12:34::1"), "2001:db8:abcd::");
  assert.equal(masquerIp("2a01:e0a::1"), "2a01:e0a::");
  assert.equal(appareilDe("Twitterbot/1.0"), "robot");
  assert.equal(appareilDe("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)"), "mobile");
});
