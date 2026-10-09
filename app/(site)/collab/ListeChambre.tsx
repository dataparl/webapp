import { CHAMBRE_LONG } from "@/lib/format";
import { dataQueryTout } from "@/lib/data";
import { CHAMBRE_COURTE } from "@/lib/collectifs";

// La liste référence des collaborateurs en poste d'une chambre, avec l'élu
// employeur et la fonction, paginée comme /collab/liste.
type Periode = { collab_id: string; elu_id: string; elu_nom: string; fonction: string };
const TAILLE_PAGE = 200;
const AU: Record<string, string> = { assemblee: "à l'Assemblée nationale", senat: "au Sénat", europarl: "au Parlement européen" };
const SOURCE: Record<string, string> = {
  assemblee: "les listes officielles publiées par l'Assemblée nationale",
  senat: "les listes officielles publiées par le Sénat",
  europarl: "les listes d'accréditation des collaborateurs suivies par DataParl' au Parlement européen",
};

export default async function ListeChambre({ chambre, page }: { chambre: "assemblee" | "senat" | "europarl"; page: number }) {
  const seg = CHAMBRE_COURTE[chambre];
  const rows = await dataQueryTout<Periode>("periodes",
    new URLSearchParams({ select: "collab_id,elu_id,elu_nom,fonction", chambre: "eq." + chambre, en_cours: "eq.true", order: "elu_nom.asc" }),
    3600).catch((): Periode[] => []);

  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / TAILLE_PAGE));
  const pageOk = Math.min(page, totalPages);
  const lignes = rows.slice((pageOk - 1) * TAILLE_PAGE, pageOk * TAILLE_PAGE);

  return (
    <>
      <p className="meta"><a href={"/collab/" + seg}>&larr; Collaborateurs {CHAMBRE_LONG[chambre]}</a> · <a href="/collab">&larr; Tous les collaborateurs</a></p>
      <h1>La liste des collaborateurs {CHAMBRE_LONG[chambre]}</h1>
      <p className="lead">
        {total.toLocaleString("fr-FR")} collaborateurs parlementaires en poste {AU[chambre]}, avec l&apos;élu employeur et la
        fonction, d&apos;après les données suivies quotidiennement par DataParl&apos;.
      </p>
      {total === 0 ? (
        <p className="meta">Aucun collaborateur en poste enregistré pour cette chambre pour l&apos;instant.</p>
      ) : (
        <table className="stats">
          <thead><tr><th>Élu employeur</th><th>Fonction</th></tr></thead>
          <tbody>
            {lignes.map((r) => (
              <tr key={r.collab_id + "-" + r.elu_id}>
                <td>{r.elu_nom}</td>
                <td>{r.fonction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {totalPages > 1 && (
        <p className="meta">
          {"Page " + pageOk + " sur " + totalPages + " — "}
          <a href={"/collab/" + seg + "/liste?page=" + (pageOk - 1)}>précédente</a>
          {" · "}
          <a href={"/collab/" + seg + "/liste?page=" + (pageOk + 1)}>suivante</a>
        </p>
      )}
      <p className="meta">
        {"Liste établie à partir de " + SOURCE[chambre] + ", mise à jour quotidiennement. Version tableur détaillée : "}
        <a href="https://media.dataparl.fr/sheets/liste_collab_dataparl">DataParl&apos; Sheets</a>.
      </p>
    </>
  );
}
