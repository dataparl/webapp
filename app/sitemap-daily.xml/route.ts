import { headers } from "next/headers";
import { aujourdhuiParis, decaler } from "@/lib/alertes";
import { joursPublies } from "@/lib/daily";

export const revalidate = 3600;

// Plan des pages daily : les ~90 derniers jours avec au moins un mouvement
// (au-delà, les pages restent accessibles mais ne sont pas poussées).
export async function GET() {
  const host = ((await headers()).get("host") ?? "").split(":")[0].toLowerCase();
  if (host !== "www.dataparl.fr") return new Response("Not found", { status: 404 });
  const base = "https://www.dataparl.fr";
  let jours: { date: string }[] = [];
  try { jours = await joursPublies(decaler(aujourdhuiParis(), -90)); } catch { /* plan vide plutôt qu'une erreur */ }
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    `<url><loc>${base}/daily</loc><changefreq>daily</changefreq><priority>0.7</priority></url>`,
    ...jours.map((j) => `<url><loc>${base}/daily/${j.date}</loc><lastmod>${j.date}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>`),
    "</urlset>",
  ].join("\n");
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, s-maxage=3600" } });
}
