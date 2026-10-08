import { imageOg, TAILLE_OG } from "@/lib/og";

// Image de partage de la page Réseau : carte DataParl' (fond bleu nuit,
// wordmark DataParl') utilisée quand le lien est partagé ou prévisualisé.
export const alt = "Le réseau des tiers payants et prestataires des eurodéputés français — DataParl'";
export const size = TAILLE_OG;
export const contentType = "image/png";

export default function Image() {
  return imageOg({
    surtitre: "Parlement européen · eurodéputés français",
    legende:
      "Tiers payants et prestataires : qui encaisse l'argent du mandat ? Toutes les structures employées par les eurodéputés, leurs clients et leurs interconnexions, sur un seul graphe.",
  });
}
