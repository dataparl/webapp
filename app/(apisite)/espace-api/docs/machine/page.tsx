import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pour les machines", alternates: { canonical: "/docs/machine" } };

export default function Machine() {
  return (
    <>
      <h1>Pour les <span className="surligne">machines</span></h1>
      <h2>OpenAPI</h2>
      <p>La description complète de l&apos;API, au format OpenAPI 3.1 : <a href="/v1/openapi.json"><code>https://api.dataparl.fr/v1/openapi.json</code></a>. Elle se charge dans Postman, Insomnia ou tout générateur de client.</p>
      <h2>Conventions</h2>
      <ul>
        <li>Encodage UTF-8, JSON uniquement, dates au format ISO <code>AAAA-MM-JJ</code>.</li>
        <li>Noms de champs et valeurs en minuscules sans accent (<code>arrivee</code>, <code>assemblee</code>).</li>
        <li>L&apos;<code>id</code> d&apos;un mouvement est stable : il sert à dédoublonner entre deux synchronisations.</li>
        <li>Les versions sont préfixées (<code>/v1</code>) ; un changement incompatible donnera une <code>/v2</code>, annoncée à l&apos;avance.</li>
        <li>CORS ouvert, mais ne mets jamais ta clé dans du code exécuté par un navigateur : passe par ton serveur.</li>
      </ul>
      <h2>Synchroniser proprement</h2>
      <ol>
        <li>Chaque jour, appelle <code>/v1/mouvements?source=suivi&amp;depuis=&lt;hier&gt;</code>.</li>
        <li>Insère les résultats en ignorant les <code>id</code> déjà connus.</li>
        <li>Espace tes appels : un passage quotidien suffit, les données changent une fois par jour.</li>
      </ol>
    </>
  );
}
