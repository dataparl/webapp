// Vérifie les liens internes du site public : menu « Explorer » et pied de
// l'accueil, pages du plan du site (hors fiches d'élus), un jour récent et une
// page volontairement absente (doit répondre 404). Sort en erreur au premier
// lien cassé. Usage : node scripts/verifier-liens.mjs [https://www.dataparl.fr]
const BASE = (process.argv[2] ?? "https://www.dataparl.fr").replace(/\/$/, "");

async function statut(url) {
  const r = await fetch(url, { redirect: "follow", headers: { "User-Agent": "DataParl-verif-liens" } });
  return { code: r.status, texte: r.ok && (r.headers.get("content-type") ?? "").includes("html") ? await r.text() : "" };
}

const accueil = await statut(`${BASE}/`);
if (accueil.code !== 200) { console.error(`Accueil : HTTP ${accueil.code}`); process.exit(1); }
const liens = new Set(
  [...accueil.texte.matchAll(/href="(\/[^"#?]*|https:\/\/www\.dataparl\.fr\/[^"#?]*)"/g)]
    .map((m) => m[1].replace("https://www.dataparl.fr", "") || "/")
    .filter((h) => !h.startsWith("/collab/") && !h.startsWith("/parlementaires/") && !h.startsWith("/_next")),
);
const indexPlans = await (await fetch(`${BASE}/sitemap.xml`)).text();
if (!indexPlans.includes("<sitemapindex")) { console.error("sitemap.xml : index des plans attendu"); process.exit(1); }
const plan = await (await fetch(`${BASE}/sitemap-pages.xml`)).text();
for (const m of plan.matchAll(/<loc>https:\/\/www\.dataparl\.fr([^<]*)<\/loc>/g)) if (!m[1].startsWith("/parlementaires/")) liens.add(m[1] || "/");
const jours = await (await fetch(`${BASE}/sitemap-daily.xml`)).text();
const jour = /<loc>https:\/\/www\.dataparl\.fr(\/daily\/\d{4}-\d{2}-\d{2})<\/loc>/.exec(jours)?.[1];
if (jour) liens.add(jour);

const casses = [];
for (const chemin of [...liens].sort()) {
  const { code } = await statut(`${BASE}${chemin}`);
  console.log(`${code} ${chemin}`);
  if (code !== 200) casses.push(`${code} ${chemin}`);
}
const absente = await statut(`${BASE}/cette-page-n-existe-pas`);
if (absente.code !== 404) casses.push(`${absente.code} (attendu 404) /cette-page-n-existe-pas`);

// Photo d'un élu servie par DataParl' (PNG), et plan du site de l'API.
const fiches = await (await fetch(`${BASE}/sitemap-parlementaires.xml`)).text();
const photo = /<image:loc>([^<]+)<\/image:loc>/.exec(fiches)?.[1];
if (photo) {
  const r = await fetch(photo);
  console.log(`${r.status} ${photo} (${r.headers.get("content-type")})`);
  if (r.status !== 200 || r.headers.get("content-type") !== "image/png") casses.push(`${r.status} ${photo}`);
} else casses.push("aucune photo dans sitemap-parlementaires.xml");
if (BASE === "https://www.dataparl.fr") {
  const api = await fetch("https://api.dataparl.fr/sitemap.xml");
  const corps = await api.text();
  console.log(`${api.status} https://api.dataparl.fr/sitemap.xml`);
  if (api.status !== 200 || !corps.includes("https://api.dataparl.fr/docs")) casses.push(`${api.status} https://api.dataparl.fr/sitemap.xml`);
}

if (casses.length) { console.error(`\nLiens cassés :\n${casses.join("\n")}`); process.exit(1); }
console.log(`\n${liens.size} liens vérifiés, aucun cassé.`);
