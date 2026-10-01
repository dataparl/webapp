import { imageOg, TAILLE_OG } from "@/lib/og";

export const alt = "DataParl' : qui travaille pour vos élus ?";
export const size = TAILLE_OG;
export const contentType = "image/png";

export default function Image() {
  return imageOg({ surtitre: "Le Parlement, pièce par pièce", legende: "Qui travaille pour vos élus ? Arrivées, départs et transferts des collaborateurs parlementaires, chaque matin." });
}
