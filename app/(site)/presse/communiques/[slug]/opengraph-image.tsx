import { imageOg, TAILLE_OG } from "@/lib/og";

export const alt = "Presse · DataParl'";
export const size = TAILLE_OG;
export const contentType = "image/png";

export default function Image() {
  return imageOg({ surtitre: "Presse", legende: "Communiqués et publications de DataParl'." });
}
