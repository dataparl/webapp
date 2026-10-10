import type { Metadata } from "next";

export const metadata: Metadata = { title: "Le jeu de données", alternates: { canonical: "/donnees" } };

export default function JeuDeDonnees() {
  return (
    <div className="etroit">
      <h1>Le jeu de <span className="surligne">données</span></h1>
      <p className="lead">
        Mouvements de collaborateurs parlementaires : arrivées, départs et transferts d&apos;un élu à un autre,
        avec la date, l&apos;élu concerné et son groupe parlementaire.
      </p>

      <h2>Description</h2>
      <ul>
        <li><strong>Producteur</strong> : DataParl&apos;, d&apos;après les publications officielles de l&apos;Assemblée nationale et du Sénat.</li>
        <li><strong>Couverture</strong> : Sénat depuis mai 2015, Assemblée nationale depuis février 2017 ; chambre <code>europarl</code> disponible via l&apos;API.</li>
        <li><strong>Actualisation</strong> : chaque matin, à partir des publications officielles.</li>
        <li><strong>Licence</strong> : ODbL 1.0 — cite la source, partage à l&apos;identique toute base dérivée.</li>
        <li><strong>Attribution</strong> : « DataParl&apos; (dataparl.fr), d&apos;après les publications de l&apos;Assemblée nationale et du Sénat ».</li>
      </ul>
      <p>
        La date d&apos;un mouvement est celle à laquelle il a été constaté, pas celle du contrat de travail.
        Le champ <code>confiance</code> signale les dates approximatives (périodes sans archive).
      </p>

      <h2>Identifiants et schéma</h2>
      <ul>
        <li><strong>Accès</strong> : <code>GET /v1/mouvements</code> — endpoints et filtres détaillés dans la <a href="/docs/technique">référence technique</a>.</li>
        <li><strong>Identifiant technique</strong> : chaque mouvement porte un <code>id</code> stable, qui sert à dédoublonner entre deux synchronisations.</li>
        <li><strong>Schéma</strong> : description complète des champs dans la spécification OpenAPI 3.1 : <a href="https://api.dataparl.fr/v1/openapi.json"><code>/v1/openapi.json</code></a>.</li>
      </ul>

      <h2>Format et conventions</h2>
      <ul>
        <li>JSON, encodage UTF-8, dates ISO <code>AAAA-MM-JJ</code>.</li>
        <li>Noms de champs et valeurs en minuscules sans accent (<code>arrivee</code>, <code>assemblee</code>).</li>
        <li>Pagination par <code>limit</code> (1 à 500) et <code>offset</code>, tri du plus récent au plus ancien.</li>
      </ul>
      <p>Voir aussi les <a href="/docs/machine">conventions pour les machines</a>.</p>

      <h2>Au-delà de l&apos;API</h2>
      <ul>
        <li><strong>Exploration humaine</strong> : les mouvements sont consultables directement sur <a href="https://www.dataparl.fr/">dataparl.fr</a>.</li>
        <li><strong>Sur data.gouv.fr</strong> : l&apos;API est référencée comme dataservice, et l&apos;organisation DataParl&apos; publie des jeux de données dérivés (turnover annuel des équipes, mixité, membres des gouvernements) : <a href="https://www.data.gouv.fr/organizations/dataparl/">data.gouv.fr/organizations/dataparl</a>.</li>
        <li><strong>Gros volumes</strong> : pour de gros volumes, préfère les fichiers complets plutôt que des milliers d&apos;appels — écris-nous via le formulaire de contact du <a href="https://www.dataparl.fr/">site principal</a>.</li>
      </ul>
    </div>
  );
}
