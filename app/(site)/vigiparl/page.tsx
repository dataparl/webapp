import type { Metadata } from "next";
import BarresAnnuelles from "@/app/_components/BarresAnnuelles";
import TableauElus from "@/app/_components/TableauStats";
import { familleDe, FAMILLES } from "@/lib/familles";
import { CHAMBRE_LONG } from "@/lib/format";
import {
  agreger, mois, pct, statsAnnuelles, statsDurees, statsElus, tauxTurnover, turnoverAnnuel,
  type StatAnnuelle, type StatDuree, type StatElu,
} from "@/lib/stats";

export const metadata: Metadata = {
  title: { absolute: "VigiParl' : le renouvellement des équipes parlementaires" },
  description: "Taux de renouvellement (turnover) des équipes de collaborateurs, par élu, groupe et chambre.",
};
export const revalidate = 3600;

const CHAMBRES = ["assemblee", "senat"] as const;

export default async function VigiParl() {
  let rows: StatElu[] = [];
  let annees: StatAnnuelle[] = [];
  let durees: StatDuree[] = [];
  try { [rows, annees, durees] = await Promise.all([statsElus(), statsAnnuelles().catch(() => []), statsDurees().catch(() => [])]); } catch {}
  const parChambre = Object.fromEntries(agreger(rows, (r) => r.chambre).map((a) => [a.cle, a]));
  const duree = Object.fromEntries(durees.map((d) => [d.chambre, d]));
  const anneeCourante = new Date().getFullYear();
  const familles = agreger(rows, (r) => familleDe(r.chambre, r.elu_groupe)?.code ?? "Autres")
    .filter((f) => f.effectif >= 10)
    .sort((a, b) => (tauxTurnover(b) ?? 0) - (tauxTurnover(a) ?? 0));

  return (
    <>
      <h1>Vigi<span className="surligne-vigi">Parl&apos;</span></h1>
      <p className="lead">
        Qui garde son équipe, qui la renouvelle sans cesse ? Le taux de renouvellement des collaborateurs sur les
        12 derniers mois, élu par élu.
      </p>

      <div className="chiffres vigi">
        {CHAMBRES.map((c) => parChambre[c] && (
          <div key={c}>
            <strong>{pct(tauxTurnover(parChambre[c]))}</strong>
            <span>de renouvellement {c === "assemblee" ? "à l'Assemblée" : "au Sénat"}</span>
          </div>
        ))}
        {CHAMBRES.map((c) => parChambre[c] && (
          <div key={`d-${c}`}>
            <strong>{parChambre[c].departs_12m.toLocaleString("fr-FR")}</strong>
            <span>départs en 12 mois ({c === "assemblee" ? "AN" : "Sénat"})</span>
          </div>
        ))}
        {CHAMBRES.map((c) => duree[c] && (
          <div key={`m-${c}`}>
            <strong>{mois(duree[c].duree_mediane_jours)}</strong>
            <span>durée médiane d&apos;un poste ({c === "assemblee" ? "AN" : "Sénat"})</span>
          </div>
        ))}
      </div>

      {annees.length > 0 && (
        <>
          <h2>L&apos;évolution année par année</h2>
          <p className="meta">Départs de l&apos;année ÷ effectif moyen (1er janvier de l&apos;année et de la suivante). Hors départs liés à la fin de mandat de l&apos;élu. L&apos;année en cours est partielle (barre atténuée).</p>
          <div className="graphiques">
            {CHAMBRES.map((c) => (
              <BarresAnnuelles key={c} titre={`Renouvellement annuel · ${CHAMBRE_LONG[c]}`} couleur="var(--vigi)" enCours={anneeCourante}
                format={(v) => pct(v)} max={0.8}
                points={annees.filter((a) => a.chambre === c).map((a) => ({ an: a.an, valeur: turnoverAnnuel(a), detail: `${a.departs} départs, ${a.effectif} collaborateurs au 1er janvier` }))} />
            ))}
          </div>
          <details className="tableau">
            <summary>Voir les chiffres</summary>
            <div className="defile">
              <table className="stats">
                <thead><tr><th>Année</th><th>Chambre</th><th className="num">Effectif au 1er janvier</th><th className="num">Départs</th><th className="num">Arrivées</th><th className="num">Taux</th></tr></thead>
                <tbody>{annees.map((a) => (
                  <tr key={`${a.chambre}-${a.an}`}><td>{a.an}{a.an === anneeCourante ? " (en cours)" : ""}</td><td>{CHAMBRE_LONG[a.chambre]}</td>
                    <td className="num">{a.effectif}</td><td className="num">{a.departs}</td><td className="num">{a.arrivees}</td><td className="num">{pct(turnoverAnnuel(a))}</td></tr>
                ))}</tbody>
              </table>
            </div>
          </details>
        </>
      )}

      {familles.length > 0 && (
        <>
          <h2>Par famille politique</h2>
          <p className="meta">Les groupes équivalents des deux chambres réunis (ex. ECO : GEST au Sénat, EcoS à l&apos;Assemblée).</p>
          <div className="defile">
            <table className="stats">
              <thead><tr><th>Famille</th><th className="num">Élus</th><th className="num">Collaborateurs</th><th className="num">Départs 12 mois</th><th className="num">Taux</th><th></th></tr></thead>
              <tbody>
                {familles.map((f) => {
                  const t = tauxTurnover(f);
                  const lib = FAMILLES.find((x) => x.code === f.cle)?.libelle;
                  return (
                    <tr key={f.cle}>
                      <td><strong>{f.cle}</strong>{lib && <span className="meta"> · {lib}</span>}</td><td className="num">{f.elus}</td><td className="num">{f.effectif}</td>
                      <td className="num">{f.departs_12m}</td><td className="num">{pct(t)}</td>
                      <td><div className="barre vigi"><span style={{ width: `${Math.min(100, (t ?? 0) * 100)}%` }} /></div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {CHAMBRES.map((c) => {
        const lignes = rows.filter((r) => r.chambre === c);
        if (!lignes.length) return null;
        const groupes = agreger(lignes, (r) => r.elu_groupe).sort((a, b) => (tauxTurnover(b) ?? 0) - (tauxTurnover(a) ?? 0));
        const tri = [...lignes].filter((r) => r.effectif + r.departs_12m >= 3)
          .sort((a, b) => (tauxTurnover(b) ?? 0) - (tauxTurnover(a) ?? 0));
        return (
          <section key={c}>
            <h2>{CHAMBRE_LONG[c]}</h2>
            <h3>Par groupe</h3>
            <div className="defile">
              <table className="stats">
                <thead><tr><th>Groupe</th><th className="num">Élus</th><th className="num">Collaborateurs</th><th className="num">Départs 12 mois</th><th className="num">Taux</th><th></th></tr></thead>
                <tbody>
                  {groupes.map((g) => {
                    const t = tauxTurnover(g);
                    return (
                      <tr key={g.cle}>
                        <td>{g.cle}</td><td className="num">{g.elus}</td><td className="num">{g.effectif}</td>
                        <td className="num">{g.departs_12m}</td><td className="num">{pct(t)}</td>
                        <td><div className="barre vigi"><span style={{ width: `${Math.min(100, (t ?? 0) * 100)}%` }} /></div></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <h3>Par élu</h3>
            <details className="tableau">
              <summary>Voir les {tri.length} élus, du renouvellement le plus fort au plus faible</summary>
              <TableauElus
                lignes={tri}
                colonnes={[
                  { titre: "Équipe actuelle", num: true, valeur: (r) => r.effectif },
                  { titre: "Départs 12 mois", num: true, valeur: (r) => r.departs_12m },
                  { titre: "Arrivées 12 mois", num: true, valeur: (r) => r.arrivees_12m },
                  { titre: "Taux", num: true, valeur: (r) => pct(tauxTurnover(r)) },
                ]}
              />
            </details>
          </section>
        );
      })}

      <h2>Méthode</h2>
      <ul>
        <li>
          <strong>Taux de renouvellement</strong> = départs sur 12 mois ÷ effectif moyen de l&apos;équipe, l&apos;effectif
          moyen étant la moyenne entre l&apos;effectif d&apos;il y a un an et l&apos;effectif actuel. Un taux supérieur à
          100 % signifie que l&apos;équipe a été renouvelée plus d&apos;une fois dans l&apos;année.
        </li>
        <li>Un départ vers l&apos;équipe d&apos;un autre élu (transfert) compte comme un départ pour l&apos;élu quitté.</li>
        <li>Les départs liés à la fin de mandat de l&apos;élu lui-même ne sont pas comptés.</li>
        <li>Les élus dont l&apos;équipe compte moins de 3 personnes sur la période sont écartés du classement.</li>
        <li>
          <strong>Durée médiane d&apos;un poste</strong> : parmi les postes terminés dont l&apos;arrivée et le départ sont datés
          (archives depuis 2015 au Sénat, 2017 à l&apos;Assemblée). Un collaborateur est reconnu à son nom : deux homonymes sont confondus.
        </li>
        <li>
          Les dates sont celles auxquelles les changements apparaissent dans les publications officielles. Sur les
          périodes couvertes par des archives espacées, plusieurs mouvements peuvent être regroupés à une même date.
        </li>
        <li>Parlement européen : suivi en pause, pas de statistiques pour l&apos;instant.</li>
      </ul>
    </>
  );
}
