"use client";

import { usePathname } from "next/navigation";
import RechercheGlobale from "./RechercheGlobale";

// Barre de recherche de l'en-tête : élus et collaborateurs, sur toutes les
// pages sauf le plan du site, le compte et les informations légales.
const SANS_BARRE = ["/sitemap", "/mon-compte", "/informations-legales"];

export default function BarreRechercheHeader() {
  const chemin = usePathname() ?? "";
  if (SANS_BARRE.some((p) => chemin === p || chemin.startsWith(`${p}/`))) return null;
  return (
    <div className="barre-header">
      <RechercheGlobale id="recherche-header" placeholder="Rechercher un élu, un collaborateur…" />
    </div>
  );
}
