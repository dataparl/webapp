import type { Metadata } from "next";
import BarresAnnuelles from "@/app/_components/BarresAnnuelles";
import TableauElus from "@/app/_components/TableauStats";
import { familleDe, FAMILLES } from "@/lib/familles";
import { CHAMBRE_LONG } from "@/lib/format";
import { agreger, partFemmes, pct, statsAnnuelles, statsElus, type StatAnnuelle, type StatElu } from "@/lib/stats";

export const metadata: Metadata = {
  title: { absolute: "MixiParl' : la mixité des équipes parlementaires" },
  description: "Part de femmes et d'hommes parmi les collaborateurs parlementaires, par élu, groupe et chambre.",
};
export const revalidate = 3600;

const CHAMBRES = ["assemblee", "senat"] as const;

function Barre({ v }: { v: number | null }) {
  return <div className="barre mixi" title={pct(v)}><span style={{ width: `${(v ?? 0) * 100}%` }} /></div>;
}

export default async function MixiParl() {
  let rows: StatElu[] = [];
  let annees: StatAnnuelle[] = [];
  try { [rows, annees] = await Promise.all([statsElus(), statsAnnuelles().catch(() => [])]); } catch {}
  const familles = agreger(rows, (r) => familleDe(r.chambre, r.elu_groupe)?.code ?? "Autres")
    .filter((f) => f.femmes + f.hommes >= 10)
    .sort((a, b) => (partFemmes(b) ?? 0) - (partFemmes(a) ?? 0));
  const parChambre = Object.fromEntries(agreger(rows, (r) => r.chambre).map((a) => [a.cle, a]));
  const avecEquipe = rows.filter((r) => r.femmes + r.hommes >= 2);
  const paritaires = avecEquipe.filter((r) => { const p = partFemmes(r) ?? 0; return p >= 0.4 && p <= 0.6; }).length;
  const nonMixtes = avecEquipe.filter((r) => r.femmes === 0 || r.hommes === 0).length;

  return (
    <>
      <h1>Mixi<span className="surligne-mixi">Parl&apos;</span></h1>
      <p className="lead">Les équipes parlementaires sont-elles mixtes ? La part de femmes et d&apos;hommes parmi les collaborateurs, élu par élu.</p>

      <div className="chiffres mixi">
        {CHAMBRES.map((c) => parChambre[c] && (
          <div key={c}>
            <strong>{pct(partFemmes(parChambre[c]))}</strong>
            <span>de femmes parmi les collaborateurs {c === "assemblee" ? "de l'Assemblée" : "du Sénat"}</span>
          </div>
        ))}
        <div><strong>{avecEquipe.length ? pct(paritaires / avecEquipe.length) : "–"}</strong><span>des équipes à parité (40 à 60 %)</span></div>
        <div><strong>{nonMixtes}</strong><span>équipes non mixtes (2 personnes ou plus)</span></div>
      </div>

      {annees.length > 0 && (
        <>
          <h2>L&apos;évolution année par année</h2>
          <p className="meta">Part de femmes parmi les collaborateurs en poste au 1er janvier de chaque année (genre déterminé).</p>
          <div className="graphiques">
            {CHAMBRES.map((c) => (
              <BarresAnnuelles key={c} titre={`Part de femmes · ${CHAMBRE_LONG[c]}`} couleur="var(--mixi)" max={1}
                format={(v) => pct(v)}
                points={annees.filter((a) => a.chambre === c).map((a) => ({ an: a.an, valeur: partFemmes(a), detail: `${a.femmes} femmes, ${a.hommes} hommes` }))} />
            ))}
          </div>
          <details className="tableau">
            <summary>Voir les chiffres</summary>
            <div className="defile">
              <table className="stats">
                <thead><tr><th>1er janvier</th><th>Chambre</th><th className="num">Femmes</th><th className="num">Hommes</th><th className="num">Part de femmes</th></tr></thead>
                <tbody>{annees.map((a) => (
                  <tr key={`${a.chambre}-${a.an}`}><td>{a.an}</td><td>{CHAMBRE_LONG[a.chambre]}</td><td className="num">{a.femmes}</td><td className="num">{a.hommes}</td><td className="num">{pct(partFemmes(a))}</td></tr>
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
              <thead><tr><th>Famille</th><th className="num">Collaborateurs</th><th className="num">Femmes</th><th className="num">Hommes</th><th className="num">Part de femmes</th><th></th></tr></thead>
              <tbody>
                {familles.map((f) => {
                  const lib = FAMILLES.find((x) => x.code === f.cle)?.libelle;
                  return (
                    <tr key={f.cle}>
                      <td><strong>{f.cle}</strong>{lib && <span className="meta"> · {lib}</span>}</td><td className="num">{f.effectif}</td>
                      <td className="num">{f.femmes}</td><td className="num">{f.hommes}</td><td className="num">{pct(partFemmes(f))}</td><td><Barre v={partFemmes(f)} /></td>
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
        const groupes = agreger(lignes, (r) => r.elu_groupe).sort((a, b) => (partFemmes(b) ?? 0) - (partFemmes(a) ?? 0));
        return (
          <section key={c}>
            <h2>{CHAMBRE_LONG[c]}</h2>
            <h3>Par groupe</h3>
            <div className="defile">
              <table className="stats">
                <thead><tr><th>Groupe</th><th className="num">Collaborateurs</th><th className="num">Femmes</th><th className="num">Hommes</th><th className="num">Part de femmes</th><th></th></tr></thead>
                <tbody>
                  {groupes.map((g) => (
                    <tr key={g.cle}>
                      <td>{g.cle}</td><td className="num">{g.effectif}</td><td className="num">{g.femmes}</td><td className="num">{g.hommes}</td>
                      <td className="num">{pct(partFemmes(g))}</td><td><Barre v={partFemmes(g)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h3>Par élu</h3>
            <details className="tableau">
              <summary>Voir les {lignes.length} élus</summary>
              <TableauElus
                lignes={lignes}
                colonnes={[
                  { titre: "Équipe", num: true, valeur: (r) => r.effectif },
                  { titre: "Femmes", num: true, valeur: (r) => r.femmes },
                  { titre: "Hommes", num: true, valeur: (r) => r.hommes },
                  { titre: "Part de femmes", num: true, valeur: (r) => pct(partFemmes(r)) },
                ]}
              />
            </details>
          </section>
        );
      })}

      <h2>Méthode</h2>
      <ul>
        <li>Sénat : le genre vient de la civilité (M. / Mme) publiée par l&apos;assemblée.</li>
        <li>
          Assemblée nationale : la liste officielle ne donne pas la civilité. Le genre est déduit du prénom, à partir de
          plus de 2 000 prénoms observés avec leur civilité dans les publications 2012-2024. Les prénoms portés par les
          deux genres (Camille, Dominique…) ou inconnus restent indéterminés
          {parChambre.assemblee ? ` (${parChambre.assemblee.indetermines} collaborateurs, soit ${pct(parChambre.assemblee.indetermines / parChambre.assemblee.effectif)})` : ""}
          {" "}et sont exclus des pourcentages.
        </li>
        <li>Les statistiques portent sur les équipes actuelles, telles que publiées à la dernière mise à jour.</li>
        <li>Parlement européen : suivi en pause, pas de statistiques pour l&apos;instant.</li>
      </ul>
    </>
  );
}
