import type { Metadata } from "next";

export const metadata: Metadata = { title: "Assistants IA (MCP)" };

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
      <h2>En attendant</h2>
      <p>
        La plupart des assistants savent lire une description OpenAPI : donne-leur{" "}
        <a href="/v1/openapi.json"><code>/v1/openapi.json</code></a> et ta clé, depuis un environnement où elle reste privée.
      </p>
      <p className="meta">Tu veux tester la version préliminaire ? Écris-nous via le <a href="https://www.dataparl.fr/contact?sujet=api">formulaire de contact</a>.</p>
    </>
  );
}
