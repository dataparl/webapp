import { headers } from "next/headers";
import { prenomNom } from "@/lib/format";
import { photoAbsolue } from "@/lib/media";
import { cheminsInactifs } from "@/lib/pagesEtat";
import { estInactif } from "@/lib/pagesRegistre";
import { tousLesParlementaires } from "@/lib/referentiel";
import { reponseXml, urlset } from "@/lib/sitemaps";

export const revalidate = 86400;

// Une fiche par parlementaire (anciens compris), avec sa photo pour les élus en fonction.
export async function GET() {
  const host = ((await headers()).get("host") ?? "").split(":")[0].toLowerCase();
  if (host !== "www.dataparl.fr") return new Response("Not found", { status: 404 });
  let elus: Awaited<ReturnType<typeof tousLesParlementaires>> = [];
  if (!estInactif("/parlementaires", await cheminsInactifs())) try { elus = await tousLesParlementaires(); } catch { /* plan vide plutôt qu'une erreur */ }
  return reponseXml(urlset(elus.map((e) => {
    const photo = e.a ? photoAbsolue(e.c, e.s, 400) : null;
    return {
      loc: `https://www.dataparl.fr/parlementaires/${encodeURIComponent(e.s)}`, changefreq: e.a ? "weekly" : "monthly", priority: e.a ? "0.8" : "0.4",
      image: photo ? { loc: photo, title: `Photo officielle de ${prenomNom(e.p, e.n)}` } : undefined,
    };
  })), 86400);
}
