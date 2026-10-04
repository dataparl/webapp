import sharp from "sharp";
import { analyserLogoGroupe, logoSource } from "@/lib/media";

// Logo d'un groupe parlementaire, servi par DataParl' :
// /media/groupes/<sigle>-<chambre>-<législature>.png
// (media.dataparl.fr/groupes/…), ex. dem-an-XVIIe.png.
// Les logos des groupes de l'Assemblée nationale proviennent de Datan
// (datan.fr), qui les publie par législature ; ils sont mis en cache un an.
export const dynamic = "force-dynamic";

const absent = () => new Response("Logo introuvable", { status: 404, headers: { "Cache-Control": "public, s-maxage=3600" } });

export async function GET(_req: Request, { params }: { params: Promise<{ fichier: string }> }) {
  const { fichier } = await params;
  const f = analyserLogoGroupe(decodeURIComponent(fichier));
  if (!f) return absent();
  const source = logoSource(f.chambre, f.sigle);
  if (!source) return absent();
  try {
    const r = await fetch(source, { headers: { "User-Agent": "DataParl (https://www.dataparl.fr)" }, signal: AbortSignal.timeout(8000), redirect: "error" });
    if (!r.ok || !(r.headers.get("content-type") ?? "").startsWith("image/")) return absent();
    const brut = Buffer.from(await r.arrayBuffer());
    if (brut.length > 4_000_000) return absent();
    const png = await sharp(brut).resize(200, 200, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png({ compressionLevel: 9 }).toBuffer();
    return new Response(new Uint8Array(png), {
      headers: {
        "Content-Disposition": `inline; filename="${f.sigle}-${f.chambre === "assemblee" ? "an" : f.chambre}-${f.romain}.png"`,
        "Content-Type": "image/png", "Cache-Control": "public, max-age=31536000, immutable",
        "X-Credit": encodeURIComponent("Logo du groupe : Datan (datan.fr)"), "Access-Control-Allow-Origin": "*",
      },
    });
  } catch { return absent(); }
}
