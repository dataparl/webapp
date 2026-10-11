import { prenomNom } from "@/lib/format";
import { photoAbsolue } from "@/lib/media";
import { cheminsInactifs } from "@/lib/pagesEtat";
import { estInactif } from "@/lib/pagesRegistre";
import { tousLesParlementaires } from "@/lib/referentiel";
import { reponseXml, urlset, type Url } from "@/lib/sitemaps";

export const revalidate = 86400;

// Une fiche par parlementaire (anciens compris), avec sa photo pour les élus en fonction.
// Sans lecture de headers() : la vérification d'hôte rendait la route
// dynamique et annulait le revalidate (chaque crawl relançait tout le
// référentiel). Les <loc> sont de toute façon en dur sur www.dataparl.fr ;
// les aperçus Vercel serviraient ce plan sans dommage (robots.txt y
// interdit l'indexation).
export async function GET() {
  let elus: Awaited<ReturnType<typeof tousLesParlementaires>> = [];
  if (!estInactif("/parlementaires", await cheminsInactifs())) try { elus = await tousLesParlementaires(); } catch { /* plan vide plutôt qu'une erreur */ }
  return reponseXml(urlset(elus.flatMap((e) => {
    const photo = e.a ? photoAbsolue(e.c, e.s, 400) : null;
    const urls: Url[] = [{
      loc: `https://www.dataparl.fr/parlementaires/${encodeURIComponent(e.s)}`, changefreq: e.a ? "weekly" : "monthly", priority: e.a ? "0.8" : "0.4",
      image: photo ? { loc: photo, title: `Photo officielle de ${prenomNom(e.p, e.n)}` } : undefined,
    }];
    if (e.a) urls.push({ loc: `https://www.dataparl.fr/parlementaires/${encodeURIComponent(e.s)}/bio`, changefreq: "weekly", priority: "0.9" });
    return urls;
  })), 86400);
}
