import sharp from "sharp";
import { analyserFichier, CHAMBRE_DE_CODE, CREDIT, sourceAutorisee } from "@/lib/media";
import { parlementaireDepuisId } from "@/lib/referentiel";

// Photo officielle d'un élu, redimensionnée et servie par DataParl' :
// /media/<chambre>/<id>_<credit>_<taille>.png (media.dataparl.fr/<chambre>/…).
// L'image vient du site de l'assemblée (crédit dans le nom et en en-tête) ;
// le crédit est dans le nom du fichier, qui se garde donc un an en cache.
export const dynamic = "force-dynamic";

const absente = () => new Response("Photo introuvable", { status: 404, headers: { "Cache-Control": "public, s-maxage=3600" } });

export async function GET(_req: Request, { params }: { params: Promise<{ chambre: string; fichier: string }> }) {
  const { chambre: code, fichier } = await params;
  const f = analyserFichier(decodeURIComponent(fichier));
  const chambre = CHAMBRE_DE_CODE[code];
  if (!f || !chambre || f.credit !== code) return absente();
  const elu = await parlementaireDepuisId(f.id).catch(() => null);
  if (!elu || elu.chambre !== chambre || !elu.photo_url || !sourceAutorisee(elu.photo_url)) return absente();
  // Les photos de l'AN portent un segment « /carre/ » que le site a supprimé
  // pour les anciennes législatures (12e–15e : 404). Sans le segment, la même
  // photo existe sur toutes les législatures : on l'essaie en repli.
  const candidates = elu.photo_url.includes("/carre/")
    ? [elu.photo_url, elu.photo_url.replace("/carre/", "/")]
    : [elu.photo_url];
  for (const source of candidates) {
    try {
      const r = await fetch(source, { headers: { "User-Agent": "DataParl (https://www.dataparl.fr)" }, signal: AbortSignal.timeout(8000), redirect: "error" });
      if (!r.ok || !(r.headers.get("content-type") ?? "").startsWith("image/")) continue;
      const brut = Buffer.from(await r.arrayBuffer());
      if (brut.length > 8_000_000) continue;
      const png = await sharp(brut).resize(f.taille, f.taille, { fit: "cover", position: "top" }).png({ compressionLevel: 9, palette: true }).toBuffer();
      return new Response(new Uint8Array(png), {
        headers: {
          "Content-Disposition": `inline; filename="${f.id}_${f.credit}_${f.taille}.png"`,
          "Content-Type": "image/png", "Cache-Control": "public, max-age=31536000, immutable", "Vary": "Accept",
          "X-Credit": encodeURIComponent(`Photo : ${CREDIT[code]}`), "Access-Control-Allow-Origin": "*", "X-Robots-Tag": "noarchive",
        },
      });
    } catch { /* on essaie la variante suivante */ }
  }
  return absente();
}
