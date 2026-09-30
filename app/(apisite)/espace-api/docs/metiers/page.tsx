import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cas d'usage" };

export default function Metiers() {
  return (
    <>
      <h1>Cas <span className="surligne">d&apos;usage</span></h1>
      <h2>Affaires publiques</h2>
      <p>Savoir qui rejoint l&apos;équipe d&apos;un rapporteur, suivre les équipes d&apos;une commission, repérer les mouvements dans un groupe.</p>
      <pre>{`/v1/mouvements?elu=PA795076&depuis=2026-01-01`}</pre>
      <h2>Journalisme</h2>
      <p>Mesurer le renouvellement des équipes après une élection, retrouver le parcours d&apos;un collaborateur entre élus et chambres.</p>
      <pre>{`/v1/mouvements?chambre=senat&depuis=2026-09-28&jusqua=2026-11-30`}</pre>
      <h2>Recherche</h2>
      <p>Constituer des séries longues (depuis 2015 au Sénat, 2017 à l&apos;Assemblée) sur la stabilité des cabinets parlementaires.</p>
      <pre>{`/v1/mouvements?source=archives&limit=500&offset=0`}</pre>
      <p className="meta">Pour de gros volumes, préfère les fichiers complets plutôt que des milliers d&apos;appels : écris-nous via le <a href="https://www.dataparl.fr/contact?sujet=api">formulaire de contact</a>.</p>
    </>
  );
}
