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
      <path fill="#0285FF" d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z" transform="scale(1.1667)" />
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
