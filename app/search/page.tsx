import { FEUILLES, type Ligne } from "@/lib/sheets";
import { feuillesPubliees } from "@/lib/sheetsPublication";

export const revalidate = 60;

type Props = { searchParams: Promise<{ q?: string }> };

const MAX_PAR_FEUILLE = 50;

// Recherche dans les feuilles publiées du tableur (drive.dataparl.fr/search) :
// un champ unique, des résultats ligne par ligne, chaque résultat pointe vers
// la feuille. Aucune donnée n'est envoyée à un tiers : la recherche tourne sur
// le serveur, dans les données déjà publiées.

export default async function RechercheBases({ searchParams }: Props) {
  const q = ((await searchParams).q ?? "").trim().toLowerCase();
  const publiees = await feuillesPubliees();
  const cibles = FEUILLES.filter((f) => publiees.includes(f.id));

  let resultats: { id: string; titre: string; entetes: string[]; cles: string[]; lignes: Ligne[]; total: number }[] = [];
  if (q.length >= 2) {
    resultats = (await Promise.all(cibles.map(async (f) => {
      let lignes: Ligne[] = [];
      try { lignes = await f.charger(); } catch { lignes = []; }
      const trouves = lignes.filter((l) => f.colonnes.some((c) => String(l[c.cle] ?? "").toLowerCase().includes(q)));
      return { id: f.id, titre: f.titre, entetes: f.colonnes.map((c) => c.label), cles: f.colonnes.map((c) => c.cle), lignes: trouves.slice(0, MAX_PAR_FEUILLE), total: trouves.length };
    }))).filter((r) => r.total > 0);
  }
  const totaux = resultats.reduce((n, r) => n + r.total, 0);

  return (
    <>
      <h1>Recherche <span className="surligne">Base de Données</span></h1>
      <p className="lead">
        Un seul champ pour chercher dans les bases de données publiées du tableur DataParl&apos;
        {cibles.length > 0 && (
          <> : {cibles.map((f, i) => <span key={f.id}>{i > 0 && ", "}<a href={`/sheets/${f.id}`}>{f.titre}</a></span>)}</>
        )}.
      </p>
      <form method="get" action="/search" className="champ-recherche">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Année, chambre, nom d&apos;un ministre, d&apos;un gouvernement…"
          aria-label="Rechercher dans les bases de données"
        />
        <button type="submit">Rechercher</button>
      </form>

      {q.length >= 2 && (
        <>
          <p className="meta">{totaux > 0 ? `${totaux} ligne${totaux > 1 ? "s" : ""} trouvée${totaux > 1 ? "s" : ""}` : "Aucun résultat."}</p>
          {resultats.map((r) => (
            <section key={r.id}>
              <h2><a href={`/sheets/${r.id}`}>{r.titre}</a></h2>
              <div className="defile">
                <table className="feuille-grille">
                  <thead>
                    <tr>{r.entetes.map((e, i) => <th key={i}>{e}</th>)}</tr>
                  </thead>
                  <tbody>
                    {r.lignes.map((l, i) => (
                      <tr key={i}>{r.cles.map((cle, j) => <td key={j}><span>{String(l[cle] ?? "")}</span></td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="meta">Consulte la feuille <a href={`/sheets/${r.id}`}>{r.titre}</a> (connexion puis courte vidéo publicitaire) pour l&apos;ensemble des données.</p>
            </section>
          ))}
        </>
      )}
    </>
  );
}
