import { imageOg, TAILLE_OG } from "@/lib/og";

export const alt = "API DataParl' : le Parlement, en JSON";
export const size = TAILLE_OG;
export const contentType = "image/png";

export default function Image() {
  return imageOg({ surtitre: "API DataParl'", legende: "Le Parlement, en JSON : mouvements et équipes des collaborateurs parlementaires, gratuits avec une clé." });
}
