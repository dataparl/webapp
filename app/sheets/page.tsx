import { FEUILLES } from "@/lib/sheets";
import { feuillesPubliees } from "@/lib/sheetsPublication";

export const revalidate = 60;

export default async function IndexSheets() {
  const publiees = await feuillesPubliees();
  const visibles = FEUILLES.filter((f) => publiees.includes(f.id));
  return (
    <>
      <h1>Le tableur de Data<span className="surligne">Parl&apos;</span></h1>
      <p className="lead">
        Le tableur de DataParl&apos;, inspiré des grands classiques et fait maison : chaque feuille part des
        données de l&apos;API. L&apos;utilisateur se connecte à DataParl&apos; puis regarde une courte vidéo
        publicitaire pour accéder à une feuille, qui reste ensuite accessible plusieurs heures.
      </p>
      <ul className="sommaire">
        {visibles.map((f) => (
          <li key={f.id}>
            <a href={`/sheets/${f.id}`}>
              <strong>{f.titre}</strong>
              <span>{f.description}</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="meta">
        Les feuilles sont consultables après connexion à DataParl&apos; ; seules les personnes de l&apos;équipe
        peuvent modifier une grille, dans leur navigateur. Les données de base viennent de l&apos;API DataParl&apos;.
      </p>
    </>
  );
}
