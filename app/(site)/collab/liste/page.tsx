import type { Metadata } from "next";
import { CHAMBRE_LONG } from "@/lib/format";
import { dataQueryTout } from "@/lib/data";

export const revalidate = 3600;
type Periode = { collab_id: string; chambre: string; elu_id: string; elu_nom: string; debut: string; fin: string; en_cours: boolean; fonction: string };

export const metadata: Metadata = {
  title: "Liste compl\u00e8te des collaborateurs parlementaires en cours de fonction",
  description: "La liste r\u00e9f\u00e9rence de tous les collaborateurs directs des d\u00e9put\u00e9s, s\u00e9nateurs et d\u00e9put\u00e9s europ\u00e9ens fran\u00e7ais en poste, toutes chambres confondues, avec l\u2019\u00e9lu employeur et la fonction.",
  alternates: { canonical: "/collab/liste" },
};

const TAILLE_PAGE = 200;

export default async function ListeCollaborateurs({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = Math.max(1, parseInt((await searchParams).page ?? "1", 10) || 1);
  const rows = await dataQueryTout<Periode>("periodes",
    new URLSearchParams({ select: "collab_id,chambre,elu_id,elu_nom,debut,fin,en_cours,fonction", en_cours: "eq.true", order: "elu_nom.asc" }));

  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / TAILLE_PAGE));
  const pageSure = Math.min(page, totalPages);
  const lignes = rows.slice((pageSure - 1) * TAILLE_PAGE, pageSure * TAILLE_PAGE);
  const parChambre = rows.reduce((m: Record<string, number>, r) => (m[r.chambre] = (m[r.chambre] ?? 0) + 1, m), {});
  const parChambreTxt = Object.entries(parChambre).map(([c, n]) => n.toLocaleString("fr-FR") + " " + (CHAMBRE_LONG[c] ?? c)).join(", ");

  return (
    <>
      <p className="meta"><a href="/collab">&larr; Collaborateurs</a></p>
      <h1>La liste compl\u00e8te des collaborateurs parlementaires</h1>
      <p className="lead">
        En octobre 2026, ${total.toLocaleString("fr-FR")} collaborateurs parlementaires sont en poste aupr\u00e8s des \u00e9lus fran\u00e7ais : ${parChambreTxt}, d\u2019apr\u00e8s les listes officielles suivies quotidiennement par DataParl'.
      </p>
      <table className="stats">
        <thead><tr><th>\u00c9lu employeur</th><th>Chambre</th><th>Fonction</th></tr></thead>
        <tbody>
        {lignes.map((r) => (
            <tr key="${r.collab_id}-{r.chambre}-{r.elu_id}">
              <td>{r.elu_nom}</td>
              <td>{CHAMBRE_LONG[r.chambre] ?? r.chambre}</td>
              <td>{r.fonction}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && (
        <p className="meta">Page ${pageS\u00fbre} sur ${totalPages} \u2014 <a href="/collab/liste?page=${pageS\u00fbre - 1}">pr\u00e9c\u00e9dente</a> \u00b7 <a href="/collab/liste?page=${pageS\u00fbre + 1}">suivante</a></p>
      )}
      <p className="meta">
        Liste \u00e9tablie \u00e0 partir des listes officielles de collaborateurs publi\u00e9es par l'Assembl\u00e9e nationale et le S\u00e9nat, mise \u00e0 jour quotidienne. Version tableur d\u00e9taill\u00e9e : <a href="https://media.dataparl.fr/sheets/liste_collab_dataparl">DataParl' Sheets</a>.
      </p>
    </>
  );
}
