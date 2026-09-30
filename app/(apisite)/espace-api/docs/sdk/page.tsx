import type { Metadata } from "next";

export const metadata: Metadata = { title: "Exemples de code" };

export default function Sdk() {
  return (
    <>
      <h1>Exemples de <span className="surligne">code</span></h1>
      <p className="lead">Pas besoin de bibliothèque : une requête HTTP suffit. Garde ta clé dans une variable d&apos;environnement.</p>
      <h2>JavaScript (Node 18+)</h2>
      <pre>{`const r = await fetch(
  "https://api.dataparl.fr/v1/mouvements?chambre=assemblee&type=arrivee&limit=50",
  { headers: { Authorization: \`Bearer \${process.env.DATAPARL_KEY}\` } },
);
if (!r.ok) throw new Error(\`DataParl' : \${r.status}\`);
const { mouvements } = await r.json();`}</pre>
      <h2>Python</h2>
      <pre>{`import os, requests

r = requests.get(
    "https://api.dataparl.fr/v1/mouvements",
    params={"chambre": "senat", "depuis": "2026-01-01", "limit": 500},
    headers={"Authorization": f"Bearer {os.environ['DATAPARL_KEY']}"},
    timeout=30,
)
r.raise_for_status()
mouvements = r.json()["mouvements"]`}</pre>
      <h2>R</h2>
      <pre>{`library(httr2)
mouvements <- request("https://api.dataparl.fr/v1/mouvements") |>
  req_url_query(chambre = "senat", limit = 500) |>
  req_auth_bearer_token(Sys.getenv("DATAPARL_KEY")) |>
  req_perform() |>
  resp_body_json()`}</pre>
      <p className="meta">Un paquet officiel viendra si le besoin s&apos;en fait sentir : dis-le-nous via le <a href="https://www.dataparl.fr/contact?sujet=api">formulaire de contact</a>.</p>
    </>
  );
}
