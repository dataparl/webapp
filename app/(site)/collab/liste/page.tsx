import type { Metadata } from "next";
import { CHAMBRE_LONG } from "@/lib/format";
import { dataQueryTout } from "@/lib/data";

export const revalidate = 3600;
type Periode = { collab_id: string; chambre: string; elu_id: string; elu_nom: string; debut: string; fin: string; en_cours: boolean; fonction: string };

export const metadata: Metadata = {
  title: "Liste complète des collaborateurs parlementaires (AN, Sénat, Parlement européen)",
  description: "La liste référence de tous les collaborateurs directs des députés, sénateurs et députés européens français en poste, toutes chambres confondues, avec l'élu employeur et la fonction.",
  alternates: { canonical: "/collab/liste" },
};

const TAILLE_PAGE = 200;

export default async function ListeCollaborateurs({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = Math.max(1, parseInt((await searchParams).page ?? "1", 10) || 1);
  const rows = await dataQueryTout<Periode>("periodes",
    new URLSearchParams({ select: "collab_id,chambre,elu_id,elu_nom,debut,fin,en_cours,fonction", en_cours: "eq.true", order: "elu_nom.asc" }));

  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / TAILLE_PAGE));
  const pageOk = Math.min(page, totalPages);
  const lignes = rows.slice((pageOk - 1) * TAILLE_PAGE, pageOk * TAILLE_PAGE);
  const parChambre = rows.reduce((m: Record<string, number>, r) => (m[r.chambre] = (m[r.chambre] ?? 0) + 1, m), {});
  const parChambreTxt = Object.entries(parChambre).map(([c, nb]) => nb.toLocaleString("fr-FR") + " " + (CHAMBRE_LONG[c] ?? c)).join(", ");
  const mois = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(new Date());
  const maj = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date());

  return (
    <>
      <p className="meta"><a href="/collab">&larr; Collaborateurs</a></p>
      <h1>La liste complète des collaborateurs parlementaires</h1>
      <p className="lead">
        {"En " + mois + ", " + total.toLocaleString("fr-FR") + " collaborateurs parlementaires sont en poste auprès des élus français : " + parChambreTxt + ", d'après les listes officielles suivies quotidiennement par DataParl'."}
      </p>
      <table className="stats">
        <thead><tr><th>Élu employeur</th><th>Chambre</th><th>Fonction</th></tr></thead>
        <tbody>
          {lignes.map((r) => (
            <tr key={r.collab_id + "-" + r.chambre + "-" + r.elu_id}>
              <td>{r.elu_nom}</td>
              <td>{CHAMBRE_LONG[r.chambre] ?? r.chambre}</td>
              <td>{r.fonction}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && (
        <p className="meta">
          {"Page " + pageOk + " sur " + totalPages + " — "}
          <a href={"/collab/liste?page=" + (pageOk - 1)}>précédente</a>
          {" · "}
          <a href={"/collab/liste?page=" + (pageOk + 1)}>suivante</a>
        </p>
      )}
      <p className="meta">
        {"Liste établie à partir des listes officielles de collaborateurs publiées par l'Assemblée nationale et le Sénat, mise à jour quotidiennement — page générée le " + maj + ". Version tableur détaillée : "}
        <a href="https://media.dataparl.fr/sheets/liste_collab_dataparl">DataParl&apos; Sheets</a>.
      </p>
    </>
  );
}
