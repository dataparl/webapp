"use client";
import { useEffect } from "react";
import Autocompletion from "./Autocompletion";

// Recherche globale : élus, collaborateurs, groupes et pages. La touche « / »
// ou « Ctrl+K / Cmd+K » place le curseur dans le champ (hors saisie en cours
// ailleurs). Avec `outil` (vigiparl/mixiparl), les élus trouvés ouvrent leur
// page d'indicateurs au lieu de leur fiche.
export default function RechercheGlobale({ placeholder = "Un élu ou un collaborateur…", id = "recherche-globale", outil }: { placeholder?: string; id?: string; outil?: string }) {
  useEffect(() => {
    const surTouche = (e: KeyboardEvent) => {
      const raccourci = (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey) || ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === "k");
      if (!raccourci) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName))) return;
      const champ = document.getElementById(id) as HTMLInputElement | null;
      if (!champ) return;
      e.preventDefault();
      champ.focus();
    };
    window.addEventListener("keydown", surTouche);
    return () => window.removeEventListener("keydown", surTouche);
  }, [id]);
  return (
    <div className="recherche-globale">
      <label htmlFor={id} className="sr-only">Rechercher un élu, un collaborateur, un groupe ou une page</label>
      <Autocompletion id={id} source="global" placeholder={placeholder} navigation outil={outil} ariaLabel="Rechercher un élu, un collaborateur, un groupe ou une page" />
      <span className="raccourci" aria-hidden="true">/</span>
    </div>
  );
}
