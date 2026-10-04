"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import RechercheGlobale from "./RechercheGlobale";

// Barre de recherche de l'en-tête : élus et collaborateurs, sur toutes les
// pages sauf le plan du site, le compte et les informations légales.
// En mobile : une petite bulle 🔍 ouvre la barre (au lieu d'une barre
// permanente qui prend toute une ligne).
// Sur les pages VigiParl'/MixiParl', les élus des résultats pointent vers
// leur page d'indicateurs (/vigiparl/PA…, /mixiparl/PA…) au lieu de la fiche.
const SANS_BARRE = ["/sitemap", "/mon-compte", "/informations-legales"];

export default function BarreRechercheHeader() {
  const chemin = usePathname() ?? "";
  const [ouvert, setOuvert] = useState(false);
  useEffect(() => { setOuvert(false); }, [chemin]);
  if (SANS_BARRE.some((p) => chemin === p || chemin.startsWith(`${p}/`))) return null;
  const outil: string | undefined = chemin.startsWith("/vigiparl") ? "vigiparl" : chemin.startsWith("/mixiparl") ? "mixiparl" : undefined;
  return (
    <>
      <div className={ouvert ? "barre-header ouverte" : "barre-header"}>
        <RechercheGlobale
          id="recherche-header"
          outil={outil}
          placeholder={outil ? "Rechercher un élu : ses indicateurs…" : "Rechercher un élu, un collaborateur…"}
        />
      </div>
      <button
        type="button"
        className="loupe-mobile"
        aria-label="Ouvrir la recherche"
        aria-expanded={ouvert}
        onClick={() => setOuvert((o) => !o)}
      >🔍</button>
    </>
  );
}
