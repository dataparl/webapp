import sharp from "sharp";
import { CREDIT } from "@/lib/media";

// Portrait officiel d'une personnalité du Gouvernement, servi par DataParl' :
// /media/gouv/<slug>_gouv_<taille>.png (media.dataparl.fr/gouv/…), où <slug>
// est le profil info.gouv.fr (ex. philippe-tabarot). La photo est lue à la
// volée sur la page officielle ; le crédit du photographe publié sous
// l'image (« Source : … ») est transmis dans l'en-tête X-Credit.
export const dynamic = "force-dynamic";

const absente = () => new Response("Photo introuvable", { status: 404, headers: { "Cache-Control": "public, s-maxage=3600" } });

const hoteOfficiel = (u: string) => {
  try { const h = new URL(u, "https://www.info.gouv.fr").hostname; return h === "www.info.gouv.fr" || h.endsWith(".gouv.fr"); } catch { return false; }
};

export async function GET(_req: Request, { params }: { params: Promise<{ fichier: string }> }) {
  const { fichier } = await params;
  const m = /^([a-z0-9-]{1,80})_gouv_(96|200|400)\.png$/.exec(decodeURIComponent(fichier));
  if (!m) return absente();
  const slug = m[1];
  const taille = Number(m[3]);
  try {
    const page = await fetch("https://www.info.gouv.fr/personnalite/" + slug, {
      headers: { "User-Agent": "DataParl (https://www.dataparl.fr)" },
      signal: AbortSignal.timeout(10000),
    });
    if (!page.ok) return absente();
    const html = await page.text();
    // Image de la page : og:image, twitter:image, ou visuel du profil.
    const candidates = [
      ...html.matchAll(/<meta[^>]+(?:property|name)="(?:og:image[^"]*|twitter:image)"[^>]+content="([^"]+)"/g),
      ...html.matchAll(/<meta[^>]+content="([^"]+)"[^>]+(?:property|name)="(?:og:image[^"]*|twitter:image)"/g),
      ...html.matchAll(/<img[^>]+src="([^"]*upload[^"]*)"/g),
    ].map((x) => x[1]).filter(Boolean);
    const image = candidates.find(hoteOfficiel);
    if (!image) return absente();
    // Crédit photographe publié sur la page (« Source : … »).
    const credit = /Source\s*:\s*([^<"\n]+)/i.exec(html)?.[1]?.trim().slice(0, 120) ?? null;
    const source = image.startsWith("http") ? image : "https://www.info.gouv.fr" + image;
    const r = await fetch(source, { headers: { "User-Agent": "DataParl (https://www.dataparl.fr)" }, signal: AbortSignal.timeout(8000) });
    if (!r.ok || !(r.headers.get("content-type") ?? "").startsWith("image/")) return absente();
    const brut = Buffer.from(await r.arrayBuffer());
    if (brut.length > 8_000_000) return absente();
    const png = await sharp(brut).resize(taille, taille, { fit: "cover", position: "top" }).png({ compressionLevel: 9, palette: true }).toBuffer();
    return new Response(new Uint8Array(png), {
      headers: {
        "Content-Disposition": `inline; filename="${slug}_gouv_${taille}.png"`,
        "Content-Type": "image/png", "Cache-Control": "public, max-age=31536000, immutable",
        "X-Credit": encodeURIComponent(`Photo : ${CREDIT.gouv}${credit ? " — " + credit : ""}`),
        "Access-Control-Allow-Origin": "*", "X-Robots-Tag": "noarchive",
      },
    });
  } catch {
    return absente();
  }
}
