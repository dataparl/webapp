import type { Metadata } from "next";

export const metadata: Metadata = { title: "Feuille de route", alternates: { canonical: "/docs/feuille-de-route" } };

export default function FeuilleDeRoute() {
  return (
    <>
      <h1>Feuille de <span className="surligne">route</span></h1>
      <p className="lead">
        Endpoints prévus, avec leur spécification cible. Ils suivront les mêmes conventions que
        l&apos;API actuelle : JSON, dates ISO, identifiants stables, licence ODbL, clés et quotas partagés.
        Ton besoin déborde de ce cadre ? Écris-nous via le formulaire de contact du site principal.
      </p>

      <h2><code>GET /v1/elus/&#123;id&#125;/equipe</code> — équipe actuelle d&apos;un élu</h2>
      <p>La composition actuelle de l&apos;équipe parlementaire d&apos;un élu, à partir des affectations en cours.</p>
      <pre>{`{
  "elu": {
    "id": "PA795076", "nom": "Julien DIVE", "chambre": "assemblee", "groupe": "LR"
  },
  "collaborateurs": [
    {
      "cle": "petit_theo", "nom": "PETIT", "prenom": "Théo", "civilite": "M.",
      "fonction": "Chef de cabinet", "depuis": "2024-07-01"
    }
  ],
  "licence": "ODbL 1.0",
  "attribution": "DataParl' (dataparl.fr), d'après les publications de l'Assemblée nationale et du Sénat"
}`}</pre>

      <h2><code>GET /v1/collaborateurs/&#123;cle&#125;</code> — parcours d&apos;un collaborateur</h2>
      <p>Tous les mouvements d&apos;un collaborateur, du plus récent au plus ancien : son parcours complet entre élus et chambres. <code>cle</code> est la clé normalisée (sans accents) déjà présente dans les réponses de <code>/v1/mouvements</code> (champ <code>collab_cle</code>).</p>
      <pre>{`{
  "collaborateur": { "cle": "petit_theo", "nom": "PETIT", "prenom": "Théo" },
  "total": 4,
  "mouvements": [
    {
      "id": "3f9c2a71b0d4e8a1", "date_event": "2026-10-10", "chambre": "assemblee",
      "type": "arrivee", "elu_nom": "Julien DIVE", "elu_groupe": "LR", "fonction": "Assistant parlementaire"
    }
  ],
  "licence": "ODbL 1.0"
}`}</pre>

      <h2><code>GET /v1/mouvements/stats</code> — agrégats</h2>
      <p>Séries agrégées par mois et par chambre ou groupe : arrivées, départs, transferts. Évite de télécharger toute l&apos;histoire pour un simple indicateur de turnover.</p>
      <pre>{`{
  "granularite": "mois",
  "depuis": "2026-01-01", "jusqua": "2026-10-10",
  "serie": [
    { "mois": "2026-09", "chambre": "assemblee", "arrivees": 142, "departs": 96, "transferts": 18 },
    { "mois": "2026-09", "chambre": "senat", "arrivees": 21, "departs": 14, "transferts": 3 }
  ],
  "licence": "ODbL 1.0"
}`}</pre>
      <p>Filtres prévus : <code>chambre</code>, <code>groupe</code>, <code>depuis</code>, <code>jusqua</code>, <code>granularite=mois|annee</code>.</p>

      <h2><code>GET /v1/groupes</code> — harmonisation des groupes</h2>
      <p>Référentiel des groupes par chambre, avec les renommages au fil du temps (ex. FN → RN, ALDE → Renew), pour interpréter <code>elu_groupe</code> dans les séries longues.</p>
      <pre>{`{
  "groupes": [
    { "chambre": "assemblee", "code": "RN", "nom": "Rassemblement National",
      "precedents": [{ "code": "FN", "jusqua": "2018-06-01" }] }
  ],
  "licence": "ODbL 1.0"
}`}</pre>

      <h2>Priorités</h2>
      <ol>
        <li>Équipes d&apos;élus (<code>/v1/elus/&#123;id&#125;/equipe</code>)</li>
        <li>Parcours collaborateur (<code>/v1/collaborateurs/&#123;cle&#125;</code>)</li>
        <li>Agrégats (<code>/v1/mouvements/stats</code>)</li>
        <li>Référentiel groupes (<code>/v1/groupes</code>)</li>
        <li>Export bulk périodique (CSV/Parquet) annoncé sur data.gouv.fr</li>
      </ol>
      <p className="meta">
        Ces spécifications sont indicatives : les champs peuvent évoluer avant la mise en service.
        Chaque ajout d&apos;endpoint sera annoncé ici et versionné dans <code>/v1/openapi.json</code>.
      </p>
    </>
  );
}
