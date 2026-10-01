"use client";
import { usePathname } from "next/navigation";
import Logo from "./Logo";

// Logo d'en-tête : la marque de la rubrique sur VigiParl' et MixiParl'
// (« VigiParl' par DataParl' »), le logo DataParl' ailleurs.
export function LogoMarque({ marque }: { marque: "vigi" | "mixi" }) {
  const prefixe = marque === "vigi" ? "Vigi" : "Mixi";
  return (
    <span className={`logo-marque ${marque}`}>
      <a className="bloc" href={`/${marque}parl`} aria-label={`${prefixe}Parl', accueil de la rubrique`}>{prefixe}<span>Parl&apos;</span></a>
      <a className="bandeau" href="/" aria-label="par DataParl', accueil">par <b>DataParl&apos;</b></a>
    </span>
  );
}

export default function LogoSite() {
  const chemin = usePathname() ?? "";
  if (chemin.startsWith("/vigiparl")) return <LogoMarque marque="vigi" />;
  if (chemin.startsWith("/mixiparl")) return <LogoMarque marque="mixi" />;
  return <Logo />;
}
