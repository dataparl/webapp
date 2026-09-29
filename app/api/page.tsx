import type { Metadata } from "next";
import GestionCles from "./GestionCles";

export const metadata: Metadata = { title: "API" };

export default function PageAPI() {
  return (
    <div className="etroit">
      <h1>L&apos;<span className="surligne">API</span> DataParl&apos;</h1>
      <p className="lead">
        Tous les mouvements de collaborateurs, en JSON, filtrables par chambre, type, date ou élu. Gratuit, avec une clé
        personnelle.
      </p>

      <h2>Mes clés</h2>
      <GestionCles />

      <h2>Utilisation</h2>
      <pre>{`curl -H "Authorization: Bearer dp_ta_cle" \\
  "https://api.cavaparlement.eu/mouvements?chambre=senat&type=arrivee&depuis=2026-01-01"`}</pre>
      <table className="stats">
        <thead><tr><th>Paramètre</th><th>Valeurs</th></tr></thead>
        <tbody>
          <tr><td><code>chambre</code></td><td><code>assemblee</code>, <code>senat</code>, <code>europarl</code></td></tr>
          <tr><td><code>type</code></td><td><code>arrivee</code>, <code>depart</code>, <code>transfert</code></td></tr>
          <tr><td><code>source</code></td><td><code>live</code> (suivi quotidien), <code>regardscitoyens</code>, <code>wayback</code> (historique)</td></tr>
          <tr><td><code>depuis</code>, <code>jusqua</code></td><td>date au format <code>AAAA-MM-JJ</code></td></tr>
          <tr><td><code>elu</code></td><td>identifiant de l&apos;élu (<code>PA…</code> à l&apos;Assemblée, matricule ou clé du nom au Sénat)</td></tr>
          <tr><td><code>limit</code>, <code>offset</code></td><td>pagination, 500 résultats au plus par appel</td></tr>
        </tbody>
      </table>
      <p>
        Quota : 1 000 requêtes par jour et par clé, indiqué dans les en-têtes <code>X-RateLimit-Limit</code> et{" "}
        <code>X-RateLimit-Remaining</code>. Les données sont sous licence ODbL : pense à citer la source. Tout est détaillé
        dans les <a href="/informations-legales/cgu-api">conditions d&apos;utilisation de l&apos;API</a>.
      </p>
      <p className="meta">
        Besoin de tout d&apos;un coup ? Les fichiers CSV complets sont sur{" "}
        <a href="https://github.com/dataparl/collaborateurs">github.com/dataparl/collaborateurs</a>.
      </p>
    </div>
  );
}
