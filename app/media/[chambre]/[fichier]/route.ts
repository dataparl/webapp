import sharp from "sharp";
import { analyserFichier, CHAMBRE_DE_CODE, CREDIT, sourceAutorisee } from "@/lib/media";
import { parlementaireDepuisId } from "@/lib/referentiel";

// Photo officielle d'un élu, redimensionnée et servie par DataParl' :
// /media/<chambre>/<id>_<credit>_<taille>.png (media.dataparl.fr/<chambre>/…).
// L'image vient du site de l'assemblée (crédit dans le nom et en en-tête) ;
// elle est gardée 30 jours par le réseau de diffusion.
export const revalidate = 2592000;

const absente = () => new Response("Photo introuvable", { status: 404, headers: { "Cache-Control": "public, s-maxage=3600" } });

export async function GET(_req: Request, { params }: { params: Promise<{ chambre: string; fichier: string }> }) {
  const { chambre: code, fichier } = await params;
  const f = analyserFichier(decodeURIComponent(fichier));
  const chambre = CHAMBRE_DE_CODE[code];
  if (!f || !chambre || f.credit !== code) return absente();
  const elu = await parlementaireDepuisId(f.id).catch(() => null);
  if (!elu || elu.chambre !== chambre || !elu.photo_url || !sourceAutorisee(elu.photo_url)) return absente();
  try {
    const r = await fetch(elu.photo_url, { headers: { "User-Agent": "DataParl (https://www.dataparl.fr)" }, signal: AbortSignal.timeout(8000), redirect: "error" });
    if (!r.ok || !(r.headers.get("content-type") ?? "").startsWith("image/")) return absente();
    const brut = Buffer.from(await r.arrayBuffer());
    if (brut.length > 8_000_000) return absente();
    const png = await sharp(brut).resize(f.taille, f.taille, { fit: "cover", position: "top" }).png({ compressionLevel: 9, palette: true }).toBuffer();
    return new Response(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png", "Cache-Control": "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=604800",
        "X-Credit": encodeURIComponent(`Photo : ${CREDIT[code]}`), "Access-Control-Allow-Origin": "*", "X-Robots-Tag": "noarchive",
      },
    });
  } catch { return absente(); }
}
