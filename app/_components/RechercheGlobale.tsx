"use client";
import Autocompletion from "./Autocompletion";

// Recherche globale : un collaborateur ou un élu, ouvre sa fiche.
export default function RechercheGlobale({ placeholder = "Un élu ou un collaborateur…" }: { placeholder?: string }) {
  return (
    <div className="recherche-globale">
      <label htmlFor="recherche-globale" className="sr-only">Rechercher un élu ou un collaborateur</label>
      <Autocompletion id="recherche-globale" source="global" placeholder={placeholder} navigation ariaLabel="Rechercher un élu ou un collaborateur" />
    </div>
  );
}
