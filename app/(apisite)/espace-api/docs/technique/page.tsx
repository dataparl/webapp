import type { Metadata } from "next";

export const metadata: Metadata = { title: "Référence technique" };

export default function Technique() {
  return (
    <>
      <h1>Référence <span className="surligne">technique</span></h1>

      <h2>Authentification</h2>
      <p>Chaque requête porte ta clé : <code>Authorization: Bearer dp_…</code> (ou <code>X-API-Key: dp_…</code>). Sans clé valide, l&apos;API répond <code>401</code>.</p>

      <h2><code>GET /v1/mouvements</code></h2>
      <table>
        <thead><tr><th>Paramètre</th><th>Valeurs</th><th>Défaut</th></tr></thead>
        <tbody>
          <tr><td><code>chambre</code></td><td><code>assemblee</code>, <code>senat</code>, <code>europarl</code></td><td>toutes</td></tr>
          <tr><td><code>type</code></td><td><code>arrivee</code>, <code>depart</code>, <code>transfert</code></td><td>tous</td></tr>
          <tr><td><code>source</code></td><td><code>suivi</code> (quotidien), <code>archives</code> (historique)</td><td>toutes</td></tr>
          <tr><td><code>depuis</code>, <code>jusqua</code></td><td>date <code>AAAA-MM-JJ</code>, bornes incluses</td><td>aucune</td></tr>
          <tr><td><code>elu</code></td><td>identifiant de l&apos;élu : <code>PA…</code> (AN), matricule (Sénat)</td><td>aucun</td></tr>
          <tr><td><code>limit</code></td><td>1 à 500</td><td>100</td></tr>
          <tr><td><code>offset</code></td><td>entier positif</td><td>0</td></tr>
        </tbody>
      </table>
      <p>Les résultats sont triés du plus récent au plus ancien. Pour tout parcourir, augmente <code>offset</code> de <code>limit</code> jusqu&apos;à dépasser <code>total</code>.</p>

      <h2>Réponse</h2>
      <pre>{`{
  "total": 1284,
  "limit": 100,
  "offset": 0,
  "mouvements": [
    {
      "id": "3f9c2a71b0d4e8a1",
      "date_event": "2026-10-02",
      "chambre": "senat",
      "type": "transfert",
      "collab_nom": "MARTIN", "collab_prenom": "Léa", "collab_civilite": "Mme",
      "elu_id": "21093M", "elu_nom": "Yannick JADOT", "elu_groupe": "GEST",
      "elu_origine_nom": "…", "elu_origine_groupe": "…",
      "contexte": "", "source": "suivi", "confiance": "bot"
    }
  ],
  "licence": "ODbL 1.0",
  "attribution": "DataParl' (dataparl.fr), d'après les publications de l'Assemblée nationale et du Sénat"
}`}</pre>
      <ul>
        <li><code>type=transfert</code> : <code>elu_*</code> désigne l&apos;élu rejoint, <code>elu_origine_*</code> l&apos;élu quitté.</li>
        <li><code>contexte</code> vaut <code>elu_sortant</code> ou <code>elu_entrant</code> quand le mouvement accompagne un changement d&apos;élu (renouvellement, fin de mandat).</li>
        <li><code>confiance=faible</code> signale une date approximative (période sans archive).</li>
      </ul>

      <h2>Quotas et erreurs</h2>
      <table>
        <thead><tr><th>Code</th><th>Signification</th></tr></thead>
        <tbody>
          <tr><td><code>400</code></td><td>paramètre invalide (le message indique lequel)</td></tr>
          <tr><td><code>401</code></td><td>clé absente, invalide ou révoquée</td></tr>
          <tr><td><code>429</code></td><td>quota du jour atteint (1 000 requêtes), remis à zéro à minuit, heure de Paris</td></tr>
          <tr><td><code>503</code></td><td>données momentanément indisponibles, réessaie plus tard</td></tr>
        </tbody>
      </table>
      <p>Chaque réponse indique le quota dans <code>X-RateLimit-Limit</code> et <code>X-RateLimit-Remaining</code>.</p>
    </>
  );
}
