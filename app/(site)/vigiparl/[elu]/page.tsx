import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BarresMensuelles, CourbeMensuelle } from "@/app/_components/CourbesMensuelles";
import { eluDepuisId, statsElu } from "@/lib/elus";
import { historiqueMensuel } from "@/lib/indicateurs";
import { CHAMBRE_LONG, idParlementaire, nomAffiche } from "@/lib/format";
import { pct, tauxTurnover } from "@/lib/stats";

export const revalidate = 3600;
type Props = { params: Promise<{ elu: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = decodeURIComponent((await params).elu);
  const e = await eluDepuisId(id).catch(() => null);
  if (!e) return { title: "VigiParl'" };
  return {
    title: `${nomAffiche(e.nom)} : le renouvellement de son équipe, mois par mois`,
    description: `Historique mensuel de l'équipe de collaborateurs de ${nomAffiche(e.nom)} : effectif, arrivées et départs depuis le début du mandat, et taux de renouvellement sur 12 mois.`,
    alternates: { canonical: `/vigiparl/${encodeURIComponent(idParlementaire(e.chambre, e.id, e.cle, e.nom))}` },
  };
}

export default async function Page({ params }: Props) {
  const id = decodeURIComponent((await params).elu);
  const e = await eluDepuisId(id).catch(() => null);
  if (!e) notFound();
  const nom = nomAffiche(e.nom);
  const [{ points, debutSuivi }, stat] = await Promise.all([
    historiqueMensuel(e).catch(() => ({ points: [], debutSuivi: null })),
    statsElu(e).catch(() => null),
  ]);
  const hrefFiche = `/parlementaires/${encodeURIComponent(idParlementaire(e.chambre, e.id, e.cle, e.nom))}`;
  const effectifs = points.map((p) => ({ mois: p.mois, valeur: p.femmes + p.hommes }));
  const maxEffectif = Math.max(2, ...effectifs.map((p) => p.valeur ?? 0));
  const dernier = points[points.length - 1];

  return (
    <>
      <p className="meta"><a href="/vigiparl">VigiParl&apos;</a> · <a href={`/vigiparl/${e.chambre === "assemblee" ? "an" : "senat"}/parlementaires`}>Classement {CHAMBRE_LONG[e.chambre]}</a></p>
      <h1>Le renouvellement de l&apos;équipe de <span className="surligne-vigi">{nom}</span></h1>
      <p className="lead">
        L&apos;équipe de collaborateurs de {nom}{e.groupe ? ` (${e.groupe})` : ""}, mois par mois depuis le début du mandat : effectif,
        arrivées et départs. <a href={hrefFiche}>Voir la fiche complète</a>. <a href="/vigiparl/methode">Méthode</a>
      </p>

      <div className="chiffres vigi paires">
        <div>
          <strong>{dernier ? dernier.femmes + dernier.hommes : e.n_collabs}</strong>
          <span>collaborateur{dernier && dernier.femmes + dernier.hommes > 1 ? "s" : ""} aujourd&apos;hui</span>
        </div>
        <div>
          <strong>{stat?.departs_12m ?? "–"}</strong>
          <span>départs sur 12 mois</span>
        </div>
        <div>
          <strong>{stat ? pct(tauxTurnover(stat)) : "–"}</strong>
          <span>taux de renouvellement (12 mois)</span>
        </div>
      </div>

      {points.length < 2 ? (
        <p className="erreur">Pas encore assez de mois de suivi pour tracer l&apos;historique de cette équipe.</p>
      ) : (
        <>
          <CourbeMensuelle titre="Effectif de l'équipe, fin de mois" points={effectifs} couleur="var(--vigi, #2563eb)" max={maxEffectif} format={(v) => String(Math.round(v))} legende={debutSuivi ? `suivi depuis ${debutSuivi}` : undefined} />
          <BarresMensuelles titre="Arrivées et départs par mois" points={points.map((p) => ({ mois: p.mois, arrivees: p.arrivees, departs: p.departs }))} />

          <div className="defile">
            <table className="stats">
              <thead><tr><th>Mois</th><th className="num">Équipe (fin de mois)</th><th className="num">Arrivées</th><th className="num">Départs</th></tr></thead>
              <tbody>
                {points.slice().reverse().map((p) => (
                  <tr key={p.mois}>
                    <td>{p.mois}</td>
                    <td className="num">{p.femmes + p.hommes}</td>
                    <td className="num">{p.arrivees || "–"}</td>
                    <td className="num">{p.departs || "–"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {stat?.premier_depart && (
        <p className="meta">
          Premier départ enregistré dans l&apos;équipe :{" "}
          {new Date(stat.premier_depart).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}.
        </p>
      )}
    </>
  );
}
