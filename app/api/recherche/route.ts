import { NextResponse } from "next/server";
import { CHAMBRE } from "@/lib/format";
import { prenomNom } from "@/lib/format";
import { rechercheGlobale } from "@/lib/referentiel";

export const dynamic = "force-dynamic";

const TEXTE = /^[\p{L}\p{N} .'’-]{2,60}$/u;

// Recherche globale : élus et collaborateurs, chacun vers sa fiche.
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (!TEXTE.test(q)) return NextResponse.json({ resultats: [] });
  try {
    const { elus, collabs } = await rechercheGlobale(q);
    const resultats = [
      ...elus.map((e) => ({
        valeur: `elu:${e.slug}`, libelle: prenomNom(e.prenom, e.nom),
        detail: [e.civilite === "Mme" ? "Élue" : "Élu", CHAMBRE[e.chambre], e.groupe, e.actif ? "" : "ancien mandat"].filter(Boolean).join(" · "),
        href: `/parlementaires/${encodeURIComponent(e.slug)}`,
      })),
      ...collabs.map((c) => ({
        valeur: `collab:${c.slug}`, libelle: prenomNom(c.prenom, c.nom),
        detail: [c.genre === "F" ? "Collaboratrice" : "Collaborateur", c.chambres.split(" ").map((x) => CHAMBRE[x]).join(", "), c.actif ? "en poste" : `jusqu'en ${c.derniere_date.slice(0, 4)}`].filter(Boolean).join(" · "),
        href: `/collab/${encodeURIComponent(c.slug)}`,
      })),
    ];
    return NextResponse.json({ resultats }, { headers: { "Cache-Control": "public, s-maxage=600" } });
  } catch {
    return NextResponse.json({ resultats: [] }, { status: 503 });
  }
}
