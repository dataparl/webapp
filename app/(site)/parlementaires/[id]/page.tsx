import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ListeMouvements from "@/app/_components/ListeMouvements";
import { CHAMBRE_LONG } from "@/lib/format";
import { eluDepuisId, equipe, lienOfficiel, mouvementsElu, statsElu } from "@/lib/elus";
import { partFemmes, pct, tauxTurnover } from "@/lib/stats";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const e = await eluDepuisId(decodeURIComponent(id)).catch(() => null);
  return e ? { title: `${e.nom} : son équipe`, description: `Les collaborateurs de ${e.nom} (${CHAMBRE_LONG[e.chambre]}) et leurs mouvements.` } : { title: "Parlementaire" };
}

export default async function Parlementaire({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const e = await eluDepuisId(decodeURIComponent(id));
  if (!e) notFound();
  const [collabs, mouvements, stats] = await Promise.all([equipe(e), mouvementsElu(e, 5), statsElu(e).catch(() => null)]);
  const officiel = lienOfficiel(e);

  return (
    <>
      <p className="meta">{CHAMBRE_LONG[e.chambre]}</p>
      <h1>{e.nom}</h1>
      <p className="lead">
        {e.groupe ? `Groupe ${e.groupe}. ` : ""}
        {collabs.length} collaborateur{collabs.length > 1 ? "s" : ""} déclaré{collabs.length > 1 ? "s" : ""} aujourd&apos;hui.
        {officiel && <> <a href={officiel}>Fiche officielle</a>.</>}
      </p>

      {stats && (
        <div className="chiffres">
          <div>
            <strong style={{ color: "var(--vigi)" }}>{pct(tauxTurnover(stats))}</strong>
            <span><a href="/vigiparl">VigiParl&apos;</a> · renouvellement sur 12 mois ({stats.departs_12m} départ{stats.departs_12m > 1 ? "s" : ""})</span>
          </div>
          <div>
            <strong style={{ color: "var(--mixi)" }}>{pct(partFemmes(stats))}</strong>
            <span><a href="/mixiparl">MixiParl&apos;</a> · de femmes ({stats.femmes} F, {stats.hommes} H{stats.indetermines ? `, ${stats.indetermines} ind.` : ""})</span>
          </div>
        </div>
      )}

      <h2>L&apos;équipe</h2>
      {collabs.length === 0 ? (
        <p className="meta">Aucun collaborateur dans la dernière publication officielle.</p>
      ) : (
        <table className="stats">
          <thead><tr><th>Collaborateur</th><th>Fonction</th></tr></thead>
          <tbody>
            {collabs.map((c, i) => (
              <tr key={i}>
                <td>{`${c.collab_civilite} ${c.collab_prenom} ${c.collab_nom}`.trim()}{c.statut === "conge_sans_solde" && <span className="meta"> (congé)</span>}</td>
                <td>{c.fonction || "Collaborateur"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p><a className="btn secondaire" href={`/collabs`}>Contacts et export de l&apos;équipe</a></p>

      <h2>Derniers mouvements</h2>
      {mouvements.length === 0 ? <p className="meta">Aucun mouvement enregistré.</p> : <ListeMouvements mouvements={mouvements} />}
      <p><a href="/mouvements">Tout l&apos;historique (compte gratuit)</a></p>
    </>
  );
}
