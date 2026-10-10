import type { Metadata } from "next";

export const metadata: Metadata = { title: "Réutilisations", alternates: { canonical: "/reutilisations" } };

export default function Reutilisations() {
  return (
    <div className="etroit">
      <h1>Réutili<span className="surligne">sations</span></h1>
      <p className="lead">
        Ce que l&apos;on fait déjà des mouvements de collaborateurs parlementaires — et comment partager ta propre réutilisation.
      </p>

      <h2>Par DataParl&apos;</h2>
      <ul>
        <li><strong>Dataparl.fr</strong> — explorer les <a href="https://www.dataparl.fr/">mouvements</a> et les fiches de parlementaires sans écrire une ligne de code.</li>
        <li><strong>VigiParl&apos;</strong> — le suivi des équipes parlementaires au fil du temps, à partir des mêmes données.</li>
        <li><strong>MixiParl&apos;</strong> — la mixité annuelle des équipes parlementaires.</li>
        <li><strong>Jeux de données dérivés</strong> — turnover annuel des équipes, mixité, membres des gouvernements, publiés sur <a href="https://www.data.gouv.fr/organizations/dataparl/">data.gouv.fr</a> sous ODbL.</li>
      </ul>

      <h2>Ta réutilisation</h2>
      <p>
        Article, visualisation, outil, travail de recherche : si tu utilises l&apos;API ou les jeux de données,
        dis-le-nous via le formulaire de contact du <a href="https://www.dataparl.fr/">site principal</a>.
        Nous listerons ici les réutilisations partagées, avec un lien vers chaque projet et vers les données utilisées.
      </p>
      <p className="meta">
        En réutilisant ces données, tu acceptes la licence ODbL 1.0 : cite « DataParl&apos; (dataparl.fr), d&apos;après
        les publications de l&apos;Assemblée nationale et du Sénat », et partage à l&apos;identique toute base dérivée.
      </p>
    </div>
  );
}
