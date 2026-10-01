import { headers } from "next/headers";
import { aujourdhuiParis } from "@/lib/alertes";
import { cheminsInactifs } from "@/lib/pagesEtat";
import { estInactif, PAGES } from "@/lib/pagesRegistre";
import { reponseXml, urlset, type Url } from "@/lib/sitemaps";
import { authAdmin } from "@/lib/supabaseAdmin";

export const revalidate = 3600;

const QUOTIDIENNES = new Set(["/", "/mouvements", "/daily", "/vigiparl", "/mixiparl"]);
const LEGALES = ["/informations-legales/mentions-legales", "/informations-legales/cgu", "/informations-legales/cgu-api", "/informations-legales/confidentialite", "/informations-legales/cookies", "/informations-legales/licences"];
const CHAMBRES = ["/mouvements/parlement", "/mouvements/assemblee", "/mouvements/senat", "/mouvements/europarl"];

// Pages éditoriales actives (d'après le Plan du site de l'admin) et communiqués publiés.
export async function GET() {
  const host = ((await headers()).get("host") ?? "").split(":")[0].toLowerCase();
  if (host !== "www.dataparl.fr") return new Response("Not found", { status: 404 });
  const base = "https://www.dataparl.fr";
  const inactifs = await cheminsInactifs();
  const jour = aujourdhuiParis();
  const urls: Url[] = [...PAGES.filter((p) => p.sitemap).map((p) => p.chemin), ...CHAMBRES, ...LEGALES]
    .filter((c) => !estInactif(c, inactifs))
    .map((c) => ({
      loc: `${base}${c === "/" ? "/" : c}`, lastmod: QUOTIDIENNES.has(c) ? jour : undefined,
      changefreq: QUOTIDIENNES.has(c) ? "daily" : c.startsWith("/informations-legales") ? "yearly" : "weekly",
      priority: c === "/" ? "1.0" : QUOTIDIENNES.has(c) ? "0.9" : c.startsWith("/informations-legales") ? "0.2" : "0.6",
    }));
  if (!estInactif("/presse/communiques", inactifs)) {
    try {
      const { data } = await authAdmin().from("communiques").select("slug, publie_le").eq("statut", "publie").order("publie_le", { ascending: false }).limit(500);
      for (const c of data ?? []) urls.push({ loc: `${base}/presse/communiques/${c.slug}`, lastmod: (c.publie_le as string).slice(0, 10), changefreq: "yearly", priority: "0.5" });
    } catch { /* sans les communiqués */ }
  }
  return reponseXml(urlset(urls));
}
