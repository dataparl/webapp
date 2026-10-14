import type { Metadata } from "next";

export const metadata: Metadata = { title: "Assistants IA (MCP)", alternates: { canonical: "/docs/mcp" } };

// Configs à copier pour brancher chaque assistant sur l'API DataParl'.
const CONFIG_CHATGPT = `{
  "name": "dataparl",
  "description": "Collaborateurs parlementaires français : équipes des élus, mouvements, turnover, mixité.",
  "openapi_url": "https://www.dataparl.fr/v1/openapi.json",
  "auth": { "type": "none" }
}`;

export default function Mcp() {
  return (
    <>
      <h1>Assistants IA <span className="surligne">(MCP)</span></h1>
      <p className="lead">
        Le Model Context Protocol permet à un assistant IA d&apos;interroger une source de données. Un serveur MCP
        DataParl&apos; est en préparation.
      </p>
      <h2>Ce qu&apos;il proposera</h2>
      <ul>
        <li><code>rechercher_mouvements</code> : mêmes filtres que <code>/v1/mouvements</code> ;</li>
        <li><code>equipe_d_un_elu</code> : les collaborateurs actuels d&apos;un élu ;</li>
        <li><code>parcours_collaborateur</code> : les passages d&apos;un collaborateur d&apos;un élu à l&apos;autre.</li>
      </ul>
      <p>Il utilisera ta clé API et ses quotas, comme n&apos;importe quel autre client.</p>
      <h2>Brancher chaque assistant dès aujourd&apos;hui</h2>
      <p>
        Tous les assistants cités ci-dessous savent exploiter une description OpenAPI : c&apos;est la voie
        la plus rapide, sans attendre le serveur MCP.
      </p>
      <h3>ChatGPT (connecteur personnalisé)</h3>
      <p>
        Paramètres → Connecteurs → Créer. Colle ce manifeste, puis authentifie-toi avec ta clé API
        (type Bearer) :
      </p>
      <pre><code>{CONFIG_CHATGPT}</code></pre>
      <h3>Claude (Anthropic)</h3>
      <p>
        Paramètres → Connecteurs → Ajouter un connecteur personnalisé, ou dans l&apos;API, passe
        l&apos;URL OpenAPI dans <code>tools[url_api_schema]</code>. Le serveur MCP distant DataParl&apos;
        sera annoncé ici dès sa mise en ligne.
      </p>
      <h3>Gemini (Google)</h3>
      <p>
        Extensions Gemini ou <code>gemini-cli</code> : déclare <code>https://www.dataparl.fr/v1/openapi.json</code>
        comme outil OpenAPI, avec ta clé dans l&apos;en-tête d&apos;autorisation.
      </p>
      <h3>Grok (xAI)</h3>
      <p>
        Grok accepte les descriptions OpenAPI dans ses outils personnalisés : mêmes URL et en-tête
        que pour Gemini.
      </p>
      <h3>Perplexity</h3>
      <p>
        Espace <em>Perplexity Pro</em> → réglages → outils personnalisés : charge la spécification
        OpenAPI DataParl&apos; et ta clé.
      </p>
      <h3>Vibe / Le Chat (Mistral)</h3>
      <p>
        Fournis <code>https://www.dataparl.fr/v1/openapi.json</code> comme outil de l&apos;agent, ou
        interroge directement le site : <code>llms.txt</code> et <code>robots.txt</code> autorisent
        explicitement les assistants Mistral.
      </p>
      <h3>En attendant, sans clé</h3>
      <p>
        Les assistants sans compte peuvent s&apos;appuyer sur <a href="/llms.txt"><code>/llms.txt</code></a>,
        le guide des pages du site, et sur le crawl autorisé des contenus publics.
      </p>
      <p className="meta">Tu veux tester la version préliminaire ? Écris-nous via le <a href="https://www.dataparl.fr/contact?sujet=api">formulaire de contact</a>.</p>
    </>
  );
}
