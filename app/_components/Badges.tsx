import { couleurChambre, couleurParti, NOM_CHAMBRE } from "@/lib/couleurs";

// Petites pastilles de couleur des fiches d'élus : la chambre (Sénat rouge,
// Assemblée nationale bleue, Parlement européen bleu européen) et le parti ou
// groupe politique (teintes usuelles). La couleur arrive en variable CSS --c :
// le fond et la bordure sont teintés par globals.css (.badge).

export function BadgeChambre({ chambre }: { chambre: string }) {
  const c = couleurChambre(chambre);
  if (!NOM_CHAMBRE[chambre]) return null;
  return (
    <span className="badge" style={{ ["--c" as string]: c }}>
      <span className="point" />
      {NOM_CHAMBRE[chambre]}
    </span>
  );
}

export function BadgeParti({ sigle, libelle }: { sigle: string; libelle?: string }) {
  if (!sigle) return null;
  return (
    <span className="badge" style={{ ["--c" as string]: couleurParti(sigle) }}>
      <span className="point" />
      {libelle || sigle}
    </span>
  );
}
