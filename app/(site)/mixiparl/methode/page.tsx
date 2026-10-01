import type { Metadata } from "next";
import { PiedMethode, VersionMethode } from "@/app/_components/EnTeteMethode";
import { derniersJours } from "@/lib/daily";
import { CHAMBRE_LONG } from "@/lib/format";
import { agreger, HISTORIQUE_METHODE, mixite, partFemmes, pct, statsAnnuelles, statsElus, type StatAnnuelle, type StatElu } from "@/lib/stats";

export const metadata: Metadata = {
  title: "Méthode MixiParl' : la mixité des équipes",
  description: "Comment DataParl' mesure la mixité des équipes parlementaires : détermination du genre, part de femmes, parité, non-mixité, exemples et limites.",
  alternates: { canonical: "/mixiparl/methode" },
};
export const revalidate = 3600;

const n = (x: number) => x.toLocaleString("fr-FR");
const CH = ["assemblee", "senat"] as const;

export default async function MethodeMixiParl() {
  const [rows, annees, donnees] = await Promise.all([
    statsElus().catch(() => [] as StatElu[]), statsAnnuelles().catch(() => [] as StatAnnuelle[]),
    derniersJours(1).then((j) => j[0]?.date ?? null).catch(() => null),
  ]);
  const parChambre = Object.fromEntries(agreger(rows, (r) => r.chambre).map((a) => [a.cle, a]));
  const m = mixite(rows.filter((r) => r.chambre !== "europarl"));
  const derniere = Math.max(0, ...annees.map((a) => a.an));
  const ex = annees.find((a) => a.chambre === "assemblee" && a.an === derniere);

  return (
    <div className="methode">
      <p className="meta"><a href="/mixiparl">MixiParl&apos;</a></p>
      <h1>Méthode <span className="surligne-mixi">MixiParl&apos;</span></h1>
      <VersionMethode donnees={donnees} historique={HISTORIQUE_METHODE.mixiparl} />
      <p className="lead">La question : <strong>les équipes parlementaires sont-elles mixtes ?</strong> Trois indicateurs y répondent : la part de femmes, la part d&apos;équipes à parité et le nombre d&apos;équipes non mixtes.</p>

      <h2 id="genre">Comment le genre est déterminé</h2>
      <ul>
        <li><strong>Sénat</strong> : d&apos;après la civilité (M. ou Mme) publiée dans la liste officielle.</li>
        <li>
          <strong>Assemblée nationale</strong> : la liste officielle ne donne pas la civilité. Le genre est déduit du prénom, grâce à un
          dictionnaire de plus de 2 000 prénoms observés avec leur civilité dans les publications 2012-2024. Un prénom porté par les deux
          genres (Camille, Dominique, Claude…) ou inconnu reste <strong>indéterminé</strong>.
        </li>
        <li>
          Les personnes de genre indéterminé sont exclues du numérateur <em>et</em> du dénominateur.
          {CH.filter((c) => parChambre[c]).map((c) => {
            const a = parChambre[c];
            return <span key={c}> {CHAMBRE_LONG[c]} : genre déterminé pour {pct((a.femmes + a.hommes) / Math.max(1, a.effectif))} des collaborateurs actuels.</span>;
          })}
        </li>
        <li>
          Le genre déduit est conservé dans la base pour calculer ces statistiques. DataParl&apos; ne publie que des chiffres agrégés
          (par élu, groupe, chambre) ; sur une fiche ou un résultat de recherche, il sert seulement à accorder l&apos;intitulé
          (collaborateur ou collaboratrice).
        </li>
      </ul>

      <h2 id="part-femmes">La part de femmes</h2>
      <div className="formule">
        <p><code>Part de femmes = collaboratrices en poste ÷ collaborateurs de genre déterminé en poste</code></p>
        <p>Pour les séries annuelles, l&apos;effectif est pris au 1er janvier de chaque année ; pour les chiffres du jour, à la dernière mise à jour.</p>
      </div>
      {ex && (
        <div className="exemple">
          <strong>Exemple chiffré : Assemblée nationale, 1er janvier {ex.an}</strong>
          <p style={{ margin: "6px 0 0" }}>
            {n(ex.femmes)} femmes et {n(ex.hommes)} hommes de genre déterminé ({n(ex.effectif - ex.femmes - ex.hommes)} indéterminés, écartés) :
            {" "}{n(ex.femmes)} ÷ ({n(ex.femmes)} + {n(ex.hommes)}) = <strong>{pct(partFemmes(ex), 1)}</strong>.
          </p>
        </div>
      )}

      <h2 id="parite">La parité d&apos;une équipe</h2>
      <div className="formule">
        <p><code>Une équipe est à parité si sa part de femmes est comprise entre 40 % et 60 % (bornes incluses)</code></p>
        <p>Calculé sur les équipes de <strong>2 personnes ou plus</strong>, dont tous les membres sont de genre déterminé.</p>
      </div>
      <p className="meta">
        Cas limite : une équipe de 2 n&apos;est à parité qu&apos;à 1 femme et 1 homme, une équipe de 3 ne l&apos;est jamais exactement
        (33 % ou 67 %) ; la fourchette 40-60 % ne nuance vraiment qu&apos;à partir de 5 membres.
      </p>

      <h2 id="non-mixite">Les équipes non mixtes</h2>
      <div className="formule">
        <p><code>Une équipe de 2 personnes ou plus est non mixte si elle compte 100 % de femmes ou 100 % d&apos;hommes</code></p>
        <p>Comptage des équipes en poste à la dernière mise à jour, avec les mêmes règles d&apos;éligibilité que la parité.</p>
      </div>
      {m.eligibles > 0 && (
        <p>
          Aujourd&apos;hui : {n(m.eligibles)} équipes éligibles, dont {n(m.paritaires)} à parité ({pct(m.paritaires / m.eligibles)})
          et {n(m.nonMixtes)} non mixtes. {n(m.exclues)} équipes comptant au moins un membre de genre indéterminé sont écartées des deux indicateurs.
        </p>
      )}

      <h2 id="exemples">Exemples</h2>
      <div className="defile"><table className="stats">
        <thead><tr><th>Équipe (fictive)</th><th className="num">Part de femmes</th><th>Parité</th><th>Non mixte</th></tr></thead>
        <tbody>
          <tr><td>3 femmes, 2 hommes</td><td className="num">60 %</td><td>Oui</td><td>Non</td></tr>
          <tr><td>4 femmes, 4 hommes</td><td className="num">50 %</td><td>Oui</td><td>Non</td></tr>
          <tr><td>1 femme, 3 hommes</td><td className="num">25 %</td><td>Non</td><td>Non</td></tr>
          <tr><td>3 femmes, 0 homme</td><td className="num">100 %</td><td>Non</td><td>Oui</td></tr>
          <tr><td>1 personne</td><td className="num">–</td><td colSpan={2}>Hors périmètre (moins de 2 personnes)</td></tr>
          <tr><td>2 femmes, 1 homme, 1 « Camille »</td><td className="num">–</td><td colSpan={2}>Écartée (un genre indéterminé)</td></tr>
        </tbody>
      </table></div>

      <h2 id="limites">Limites</h2>
      <ul>
        <li>À l&apos;Assemblée, le genre est une déduction : un prénom peut être porté autrement que la majorité des cas observés.</li>
        <li>Les prénoms épicènes et rares restent indéterminés, ce qui écarte certaines équipes des indicateurs de parité.</li>
        <li>Le genre est binaire dans les publications officielles (civilité M. ou Mme) : la mesure l&apos;est donc aussi.</li>
        <li>Parlement européen : suivi en pause, pas de statistiques pour l&apos;instant.</li>
      </ul>

      {annees.length > 0 && (
        <>
          <h2 id="table-annuelle">La table annuelle</h2>
          <div className="defile">
            <table className="stats">
              <thead><tr><th>1er janvier</th><th>Chambre</th><th className="num">Femmes</th><th className="num">Hommes</th><th className="num">Indéterminés</th><th className="num">Part de femmes</th></tr></thead>
              <tbody>{annees.map((a) => (
                <tr key={`${a.chambre}-${a.an}`}><td>{a.an}</td><td>{CHAMBRE_LONG[a.chambre]}</td><td className="num">{n(a.femmes)}</td><td className="num">{n(a.hommes)}</td>
                  <td className="num">{n(a.effectif - a.femmes - a.hommes)}</td><td className="num">{pct(partFemmes(a), 1)}</td></tr>
              ))}</tbody>
            </table>
          </div>
        </>
      )}
      <PiedMethode historique={HISTORIQUE_METHODE.mixiparl} csv="/mixiparl/annuel.csv" />
    </div>
  );
}
