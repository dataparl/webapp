import type { Metadata } from "next";

export const metadata: Metadata = { title: { absolute: "API DataParl' : le Parlement, en JSON" }, alternates: { canonical: "/" } };

export default function AccueilApi() {
  return (
    <>
      <h1>Le Parlement, <span className="surligne">en JSON</span>.</h1>
      <p className="lead">
        L&apos;API DataParl&apos; met à disposition les mouvements des collaborateurs parlementaires, collectés chaque matin
        dans les publications officielles de l&apos;Assemblée nationale et du Sénat : arrivées, départs et transferts,
        du Sénat depuis 2015 et de l&apos;Assemblée depuis 2017. Gratuit, avec une clé personnelle.
      </p>
      <pre>{`curl -H "Authorization: Bearer dp_ta_cle" \\\n  "https://api.dataparl.fr/v1/mouvements?chambre=senat&type=arrivee&depuis=2026-01-01"`}</pre>
      <div className="chiffres">
        <div><strong>1</strong><span>clé gratuite par compte</span></div>
        <div><strong>1 000</strong><span>requêtes par jour</span></div>
        <div><strong>ODbL</strong><span>données réutilisables</span></div>
      </div>
      <a className="btn" href="/request-access">Demander ma clé</a>{" "}
      <a className="btn secondaire" href="/docs">Lire la documentation</a>

      <h2>Le jeu de données</h2>
      <ul className="sommaire">
        <li><a href="/donnees"><strong>Fiche du jeu de données</strong><span>Description, producteur, licence, couverture, schéma →</span></a></li>
        <li><a href="/reutilisations"><strong>Réutilisations</strong><span>Ce que l&apos;on fait déjà avec les données, et comment partager la tienne →</span></a></li>
      </ul>

      <h2>La documentation</h2>
      <ul className="sommaire">
        <li><a href="/docs/technique"><strong>Référence technique</strong><span>Endpoints, paramètres, erreurs, quotas →</span></a></li>
        <li><a href="/docs/metiers"><strong>Cas d&apos;usage</strong><span>Affaires publiques, journalisme, recherche →</span></a></li>
        <li><a href="/docs/machine"><strong>Pour les machines</strong><span>OpenAPI, formats, conventions →</span></a></li>
        <li><a href="/docs/sdk"><strong>Exemples de code</strong><span>JavaScript, Python, R →</span></a></li>
        <li><a href="/docs/mcp"><strong>Assistants IA (MCP)</strong><span>Brancher DataParl&apos; à un assistant →</span></a></li>
      </ul>
    </>
  );
}
