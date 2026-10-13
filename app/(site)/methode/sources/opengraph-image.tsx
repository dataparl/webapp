import { imageOg, TAILLE_OG } from "@/lib/og";

export const alt = "Sources · DataParl'";
export const size = TAILLE_OG;
export const contentType = "image/png";

export default function Image() {
  return imageOg({ surtitre: "Sources", legende: "Les publications officielles derrière chaque chiffre de DataParl'." });
}
