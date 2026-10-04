import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À propos de DataParl'",
  description: "Qui est derrière DataParl', pourquoi ce site existe, comment il est financé et où nous suivre.",
  alternates: { canonical: "/a-propos" },
};
export const revalidate = 86400;

// Logos des réseaux, en SVG inline (aucune dépendance, aucun traqueur).
function LogoBluesky() {
  return (
    <svg viewBox="0 0 64 64" width="28" height="28" aria-hidden="true">
      <path fill="#0285FF" d="M13.9 10.1C21.7 16 30.2 27.9 32 36.9c1.8-9 10.3-20.9 18.1-26.8 5.3-4 11-6 13.4-2.6 2.4 3.5 1.2 10.9-2.6 18.3-7 13.6-19.6 26-25.8 26h-.6c-6.2 0-18.8-12.4-25.8-26C4.9 18.3 3.7 10.9 6.1 7.4c2.4-3.4 8.1-1.4 13.4 2.6z" transform="scale(0.94)" />
    </svg>
  );
}
function LogoX() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
      <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
function LogoLinkedIn() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
      <path fill="#0A66C2" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.554V9h3.565v11.452z" />
    </svg>
  );
}

const RESEAUX = [
  { href: "https://bsky.app/profile/dataparl.fr", nom: "Bluesky", logo: <LogoBluesky /> },
  { href: "https://x.com/DataParl_fr", nom: "X (Twitter)", logo: <LogoX /> },
  { href: "https://www.linkedin.com/company/dataparl/", nom: "LinkedIn", logo: <LogoLinkedIn /> },
];

export default function APropos() {
  return (
    <div className="etroit">
      <h1>À propos de <span className="surligne">DataParl&apos;</span></h1>
      <p className="lead">
        DataParl&apos; relit chaque matin les listes officielles des collaborateurs parlementaires et reconstitue,
        depuis 2015, qui travaille pour quel élu. Un projet indépendant, transparent et librement réutilisable.
      </p>

      <h2>Pourquoi ce site</h2>
      <p>
        Les équipes des parlementaires sont une pièce mal connue du travail parlementaire : des milliers de
        personnes travaillent dans l&apos;ombre des députés, sénateurs et eurodéputés, sans que rien n&apos;en soit
        publié de façon lisible. DataParl&apos; met ces données au clair : arrivées, départs, transferts,
        parcours reconstitués — avec leur source officielle à chaque fois.
      </p>

      <h2>Comment c&apos;est fait</h2>
      <ul>
        <li>Les données viennent des <strong>listes officielles</strong> publiées par l&apos;Assemblée nationale, le Sénat et le Parlement européen, complétées par les archives publiées au JORF.</li>
        <li>Tout est sourcé : chaque chiffre affiché renvoie à sa source, la <a href="/methode">méthode</a> est publiée en détail et datée.</li>
        <li>Les données sont publiées sous <strong>licence ODbL</strong> : libre réutilisation avec mention.</li>
        <li>Le financement est indépendant : pas de publicité partisane, pas de revente de données nominatives à des fins de ciblage.</li>
      </ul>

      <h2>Nos réseaux sociaux</h2>
      <p>Suivez les mouvements et les nouveautés du site :</p>
      <ul className="reseaux">
        {RESEAUX.map((r) => (
          <li key={r.href}>
            <a href={r.href}>
              {r.logo}
              <span>{r.nom}</span>
              <span className="meta">→</span>
            </a>
          </li>
        ))}
      </ul>

      <h2>Nous contacter</h2>
      <p>Une question, une correction, un souhait de réutilisation des données ? <a href="/contact">Écrivez-nous</a>.</p>
    </div>
  );
}
