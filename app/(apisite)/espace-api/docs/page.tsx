import type { Metadata } from "next";

export const metadata: Metadata = { title: "Documentation" };

export default function Docs() {
  return (
    <>
      <h1><span className="surligne">Documentation</span></h1>
      <p className="lead">L&apos;API DataParl&apos; expose les arrivées, départs et transferts de collaborateurs parlementaires, avec leur date, l&apos;élu concerné et son groupe.</p>
      <h2>En trois étapes</h2>
      <ol>
        <li>Crée un compte DataParl&apos;, puis <a href="/request-access">demande ta clé</a> (gratuite, une par compte).</li>
        <li>Envoie-la dans l&apos;en-tête <code>Authorization: Bearer dp_…</code> de chaque requête.</li>
        <li>Interroge <code>https://api.cavaparlement.eu/v1/mouvements</code> avec les filtres de ton choix.</li>
      </ol>
      <h2>Bon à savoir</h2>
      <ul>
        <li>Mise à jour chaque matin, à partir des publications officielles de l&apos;Assemblée nationale et du Sénat.</li>
        <li>Historique : Sénat depuis mai 2015, Assemblée nationale depuis février 2017.</li>
        <li>La date d&apos;un mouvement est celle à laquelle il a été constaté, pas celle du contrat de travail.</li>
        <li>Données sous licence ODbL : cite la source, partage à l&apos;identique toute base dérivée.</li>
      </ul>
    </>
  );
}
