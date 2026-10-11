import { aujourdhuiParis, decaler } from "@/lib/alertes";
import { joursPublies } from "@/lib/daily";
import { cheminsInactifs } from "@/lib/pagesEtat";
import { estInactif } from "@/lib/pagesRegistre";

export const revalidate = 3600;

// Plan des pages daily : les ~90 derniers jours avec au moins un mouvement
// (au-delà, les pages restent accessibles mais ne sont pas poussées).
// Sans lecture de headers() : la vérification d'hôte rendait la route
// dynamique et annulait le revalidate (chaque crawl relançait la requête
// des jours publiés). Les <loc> sont en dur sur www.dataparl.fr ; les
// aperçus Vercel serviraient ce plan sans dommage (robots.txt y interdit
// l'indexation).
export async function GET() {
  const base = "https://www.dataparl.fr";
  let jours: { date: string }[] = [];
  if (!estInactif("/daily", await cheminsInactifs())) try { jours = await joursPublies(decaler(aujourdhuiParis(), -90)); } catch { /* plan vide plutôt qu'une erreur */ }
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    `<url><loc>${base}/daily</loc><changefreq>daily</changefreq><priority>0.7</priority></url>`,
    ...jours.map((j) => `<url><loc>${base}/daily/${j.date}</loc><lastmod>${j.date}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>`),
    "</urlset>",
  ].join("\n");
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, s-maxage=3600" } });
}
