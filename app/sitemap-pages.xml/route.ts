import { headers } from "next/headers";
import { aujourdhuiParis } from "@/lib/alertes";
import { cheminsInactifs } from "@/lib/pagesEtat";
import { estInactif, PAGES } from "@/lib/pagesRegistre";
import { reponseXml, urlset, type Url } from "@/lib/sitemaps";
import { authAdmin } from "@/lib/supabaseAdmin";

export const revalidate = 3600;

const QUOTIDIENNES = new Set(["/", "/mouvements", "/daily", "/vigiparl", "/mixiparl"]);
const CHAMBRES = ["/mouvements/parlement", "/mouvements/assemblee", "/mouvements/senat", "/mouvements/europarl"];

// Pages éditoriales actives (d'après le Plan du site de l'admin) et communiqués publiés.
export async function GET() {
  const host = ((await headers()).get("host") ?? "").split(":")[0].toLowerCase();
  if (host !== "www.dataparl.fr") return new Response("Not found", { status: 404 });
  const base = "https://www.dataparl.fr";
  const inactifs = await cheminsInactifs();
  const jour = aujourdhuiParis();
  const urls: Url[] = [...PAGES.filter((p) => p.sitemap).map((p) => p.chemin), ...CHAMBRES, ...[], "/senatoriales2026"]
    .filter((c) => !estInactif(c, inactifs) && !c.startsWith("/informations-legales"))
    .map((c) => ({
      loc: `${base}${c === "/" ? "/" : c}`, lastmod: QUOTIDIENNES.has(c) ? jour : undefined,
      changefreq: QUOTIDIENNES.has(c) ? "daily" : c.startsWith("/informations-legales") ? "yearly" : "weekly",
      priority: c === "/" ? "1.0" : QUOTIDIENNES.has(c) ? "0.9" : c.startsWith("/informations-legales") ? "0.2" : c === "/senatoriales2026" ? "0.8" : "0.6",
    }));
  // Pages d'informations légales publiées (hors registre éditorial).
  urls.push({ loc: `${base}/informations-legales/cgu-chat`, changefreq: "yearly", priority: "0.2" });
  // Une page par département renouvelé aux sénatoriales 2026 (données du référentiel).
  if (!estInactif("/senatoriales2026", inactifs)) {
    try {
      const { senatoriales2026 } = await import("@/lib/senatoriales");
      const { departements } = await senatoriales2026();
      for (const d of departements) urls.push({ loc: `${base}/senatoriales2026/${d.slug}`, changefreq: "weekly", priority: "0.7" });
    } catch { /* sans les sénatoriales */ }
  }
  // Une page par groupe parlementaire (données du référentiel).
  if (!estInactif("/groupe", inactifs)) {
    try {
      const { hrefGroupe } = await import("@/lib/collectifs");
      const { groupesExistants } = await import("@/lib/collectifsData");
      for (const g of await groupesExistants()) {
        const href = hrefGroupe(g.chambre, g.groupe);
        if (href) urls.push({ loc: `${base}${href}`, changefreq: "weekly", priority: "0.6" });
      }
    } catch { /* sans les groupes */ }
  }
  // Une page par mandature (législature ou série de renouvellement), pour chaque chambre.
  if (!estInactif("/groupe", inactifs)) {
    try {
      const { CHAMBRE_COURTE } = await import("@/lib/collectifs");
      const { mandaturesExistantes } = await import("@/lib/mandaturesData");
      for (const m of await mandaturesExistantes()) {
        const c = CHAMBRE_COURTE[m.chambre];
        if (c) urls.push({ loc: `${base}/groupe/${c}/${m.slug}`, changefreq: "weekly", priority: "0.6" });
      }
    } catch { /* sans les mandatures */ }
  }
  // Une page par scrutin sénatorial (série × année de renouvellement).
  if (!estInactif("/groupe", inactifs)) {
    try {
      const { scrutinsExistants } = await import("@/lib/mandaturesData");
      for (const s of await scrutinsExistants()) {
        urls.push({ loc: `${base}/groupe/senat/serie-${s.serie}/${s.annee}`, changefreq: "weekly", priority: "0.6" });
      }
    } catch { /* sans les scrutins */ }
  }
  // Une page d'accueil et une liste de collaborateurs par chambre.
  if (!estInactif("/collab", inactifs)) {
    try {
      const { CHAMBRE_COURTE } = await import("@/lib/collectifs");
      for (const chambre of ["assemblee", "senat", "europarl"]) {
        const seg = CHAMBRE_COURTE[chambre];
        if (!seg) continue;
        urls.push({ loc: `${base}/collab/${seg}`, changefreq: "weekly", priority: "0.6" });
        urls.push({ loc: `${base}/collab/${seg}/liste`, changefreq: "weekly", priority: "0.6" });
      }
    } catch { /* sans les chambres */ }
  }
  // Une page par structure du Parlement européen (tiers payants, prestataires).
  try {
    const { FONCTIONS_STRUCTURES, slugStructure, structures } = await import("@/lib/structures");
    for (const [fonction, f] of Object.entries(FONCTIONS_STRUCTURES)) {
      if (estInactif(`/collab/pe/${f.slug}`, inactifs)) continue;
      for (const s of await structures(fonction as keyof typeof FONCTIONS_STRUCTURES)) {
        urls.push({ loc: `${base}/collab/pe/${f.slug}/${slugStructure(s.nom)}`, changefreq: "weekly", priority: "0.5" });
      }
    }
  } catch { /* sans les structures */ }
  // Une page par département représenté.
  if (!estInactif("/departement", inactifs)) {
    try {
      const { slugDepartement } = await import("@/lib/senatoriales");
      const { departementsExistants } = await import("@/lib/collectifsData");
      for (const d of await departementsExistants()) {
        const slug = slugDepartement(d);
        if (slug) urls.push({ loc: `${base}/departement/${slug}/`, changefreq: "weekly", priority: "0.6" });
      }
    } catch { /* sans les départements */ }
  }
  // Une page par parti politique.
  if (!estInactif("/parti", inactifs)) {
    try {
      const { hrefParti } = await import("@/lib/collectifs");
      const { partisExistants } = await import("@/lib/collectifsData");
      for (const p of await partisExistants()) {
        const href = hrefParti(p);
        if (href) urls.push({ loc: `${base}${href}`, changefreq: "weekly", priority: "0.6" });
      }
    } catch { /* sans les partis */ }
  }
  if (!estInactif("/presse/communiques", inactifs)) {
    try {
      const { data } = await authAdmin().from("communiques").select("slug, publie_le").eq("statut", "publie").order("publie_le", { ascending: false }).limit(500);
      for (const c of data ?? []) urls.push({ loc: `${base}/presse/communiques/${c.slug}`, lastmod: (c.publie_le as string).slice(0, 10), changefreq: "yearly", priority: "0.5" });
    } catch { /* sans les communiqués */ }
  }
  return reponseXml(urlset(urls));
}
