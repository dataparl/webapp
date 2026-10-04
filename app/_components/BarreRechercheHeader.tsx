"use client";

import { usePathname } from "next/navigation";
import RechercheGlobale from "./RechercheGlobale";

// Barre de recherche de l'en-tête : élus et collaborateurs, toujours visible
// au milieu de l'en-tête (entre le logo et le menu), sauf sur le plan du
// site, le compte et les informations légales.
// Sur les pages VigiParl'/MixiParl', les élus des résultats pointent vers
// leur page d'indicateurs (/vigiparl/PA…, /mixiparl/PA…) au lieu de la fiche.
const SANS_BARRE = ["/sitemap", "/mon-compte", "/informations-legales"];

export default function BarreRechercheHeader() {
  const chemin = usePathname() ?? "";
  if (SANS_BARRE.some((p) => chemin === p || chemin.startsWith(`${p}/`))) return null;
  const outil: string | undefined = chemin.startsWith("/vigiparl") ? "vigiparl" : chemin.startsWith("/mixiparl") ? "mixiparl" : undefined;
  return (
    <div className="barre-header">
      <RechercheGlobale
        id="recherche-header"
        outil={outil}
        placeholder={outil ? "Rechercher un élu : ses indicateurs…" : "Rechercher un élu, un collaborateur…"}
      />
    </div>
  );
}
