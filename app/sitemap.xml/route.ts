import { headers } from "next/headers";
import { tousLesParlementaires } from "@/lib/referentiel";

export const revalidate = 86400;

const PAGES = ["", "/mouvements", "/collab", "/parlementaires", "/vigiparl", "/mixiparl", "/alertes", "/faq",
  "/espace-presse", "/contact", "/informations-legales"];

// Plan du site : pages publiques et une fiche par parlementaire (anciens compris).
export async function GET() {
  const host = ((await headers()).get("host") ?? "").split(":")[0].toLowerCase();
  if (host !== "www.dataparl.fr") return new Response("Not found", { status: 404 });
  const base = "https://www.dataparl.fr";
  let elus: { s: string; a: boolean }[] = [];
  try { elus = await tousLesParlementaires(); } catch { /* le plan reste utile sans les fiches */ }
  const url = (loc: string, priorite: string, freq: string) =>
    `<url><loc>${base}${loc}</loc><changefreq>${freq}</changefreq><priority>${priorite}</priority></url>`;
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...PAGES.map((p) => url(p || "/", p ? "0.6" : "1.0", "daily")),
    ...elus.map((e) => url(`/parlementaires/${encodeURIComponent(e.s)}`, e.a ? "0.8" : "0.4", e.a ? "weekly" : "monthly")),
    "</urlset>",
  ].join("\n");
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, s-maxage=86400" } });
}
