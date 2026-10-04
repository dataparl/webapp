import { FEUILLES } from "@/lib/sheets";

export const revalidate = 3600;

export default async function IndexSheets() {
  return (
    <>
      <h1>Le tableur de <span className="surligne">DataParl&apos;</span></h1>
      <p className="lead">
        Le tableur de DataParl&apos;, inspiré des grands classiques (Google Sheets, Microsoft Excel) et fait maison :
        chaque feuille part des données de l&apos;API, puis se modifie dans le navigateur — formules{" "}
        (<code>=SOMME(A2:A19)</code>, <code>=MOYENNE(...)</code>…), sauvegarde automatique et export CSV.
        Aucun compte, aucun serveur à payer : tout tourne sur l&apos;appareil.
      </p>
      <ul className="sommaire">
        {FEUILLES.map((f) => (
          <li key={f.id}>
            <a href={`/sheets/${f.id}`}>
              <strong>{f.titre}</strong>
              <span>{f.description}</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="meta">
        Logiciel libre (MIT) · données sous licence ODbL · l&apos;essentiel du tableur est inspiré de Google Sheets et Microsoft Excel, en plus simple et sans dépendance.
      </p>
    </>
  );
}
