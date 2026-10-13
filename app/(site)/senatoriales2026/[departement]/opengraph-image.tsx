import { imageOg, TAILLE_OG } from "@/lib/og";

export const alt = "Sénatoriales 2026 · DataParl'";
export const size = TAILLE_OG;
export const contentType = "image/png";

export default function Image() {
  return imageOg({ surtitre: "Sénatoriales 2026", legende: "Nouveaux sénateurs élus et sortants, avec leurs groupes politiques et leurs équipes." });
}
