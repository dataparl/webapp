"use client";
import { usePathname } from "next/navigation";
import Logo from "./Logo";

// Logo d'en-tête : sur VigiParl' et MixiParl', la marque de la rubrique avec
// « par DataParl' » en dessous ; le logo DataParl' ailleurs.
export function LogoMarque({ marque }: { marque: "vigi" | "mixi" }) {
  const prefixe = marque === "vigi" ? "Vigi" : "Mixi";
  return (
    <span className={`logo-marque ${marque}`}>
      <a className="haut" href={`/${marque}parl`} aria-label={`${prefixe}Parl', accueil de la rubrique`}>{prefixe}<span>Parl&apos;</span></a>
      <a className="par" href="/" aria-label="par DataParl', accueil">par <b>Data<span>Parl&apos;</span></b></a>
    </span>
  );
}

export default function LogoSite() {
  const chemin = usePathname() ?? "";
  if (chemin.startsWith("/vigiparl")) return <LogoMarque marque="vigi" />;
  if (chemin.startsWith("/mixiparl")) return <LogoMarque marque="mixi" />;
  return <Logo />;
}
